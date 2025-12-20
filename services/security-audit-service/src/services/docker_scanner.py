import subprocess
import json
from typing import List
from models.scan import ScanResult, Vulnerability, Severity, ScanType


class DockerScanner:
    """Scanner d'images Docker avec Trivy"""
    
    def scan_docker_image(self, image_name: str) -> ScanResult:
        """
        Scan d'une image Docker avec Trivy.
        
        Args:
            image_name: Nom de l'image Docker à scanner
            
        Returns:
            ScanResult avec les vulnérabilités détectées
        """
        print(f"🔍 Scanning Docker image: {image_name}")
        
        try:
            # Exécuter Trivy
            result = subprocess.run(
                [
                    "trivy",
                    "image",
                    "--format", "json",
                    "--severity", "CRITICAL,HIGH,MEDIUM,LOW",
                    image_name
                ],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes max
            )
            
            if result.returncode == 0:
                trivy_data = json.loads(result.stdout)
                vulnerabilities = self._parse_trivy_results(trivy_data, image_name)
                return self._create_scan_result(vulnerabilities)
            else:
                print(f"⚠️ Trivy returned non-zero exit code: {result.returncode}")
                print(f"stderr: {result.stderr}")
            
        except subprocess.TimeoutExpired:
            print("⏰ Trivy scan timeout")
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing Trivy output: {e}")
        except FileNotFoundError:
            print("❌ Trivy not found. Please install Trivy first.")
        except Exception as e:
            print(f"❌ Error running Trivy: {e}")
        
        # Fallback: retourner un résultat vide
        return ScanResult(scan_type=ScanType.DOCKER)
    
    def _parse_trivy_results(self, trivy_data: dict, image_name: str) -> List[Vulnerability]:
        """
        Parse les résultats de Trivy.
        
        Args:
            trivy_data: Données JSON de Trivy
            image_name: Nom de l'image scannée
            
        Returns:
            Liste de Vulnerability
        """
        vulnerabilities = []
        
        # Trivy structure: Results -> Vulnerabilities
        results = trivy_data.get("Results", [])
        
        for result in results:
            target = result.get("Target", image_name)
            vulns = result.get("Vulnerabilities", [])
            
            for vuln in vulns:
                # Mapper la sévérité Trivy vers notre enum
                severity_map = {
                    "CRITICAL": Severity.CRITICAL,
                    "HIGH": Severity.HIGH,
                    "MEDIUM": Severity.MEDIUM,
                    "LOW": Severity.LOW,
                    "UNKNOWN": Severity.INFO
                }
                
                severity = severity_map.get(
                    vuln.get("Severity", "UNKNOWN"),
                    Severity.INFO
                )
                
                # Composant affecté
                pkg_name = vuln.get("PkgName", "unknown")
                installed_version = vuln.get("InstalledVersion", "unknown")
                fixed_version = vuln.get("FixedVersion", "Not fixed yet")
                
                affected_component = f"{pkg_name}@{installed_version} (in {target})"
                
                # Description
                title = vuln.get("Title", "Docker vulnerability")
                description = vuln.get("Description", title)
                
                vulnerability = Vulnerability(
                    id=vuln.get("VulnerabilityID", "TRIVY-UNKNOWN"),
                    severity=severity,
                    description=description,
                    affected_component=affected_component,
                    cve_id=vuln.get("VulnerabilityID") if vuln.get("VulnerabilityID", "").startswith("CVE") else None,
                    cvss_score=self._extract_cvss_score(vuln),
                    recommendation=f"Update {pkg_name} to version {fixed_version}" if fixed_version != "Not fixed yet" else "No fix available yet"
                )
                
                vulnerabilities.append(vulnerability)
        
        return vulnerabilities
    
    def _extract_cvss_score(self, vuln: dict) -> float:
        """
        Extrait le score CVSS de la vulnérabilité Trivy.
        """
        # Trivy peut avoir plusieurs scores CVSS
        cvss_data = vuln.get("CVSS", {})
        
        # Essayer d'obtenir le score CVSS v3 en premier
        for vendor, data in cvss_data.items():
            if "V3Score" in data:
                return data["V3Score"]
            elif "V2Score" in data:
                return data["V2Score"]
        
        return None
    
    def _create_scan_result(self, vulnerabilities: List[Vulnerability]) -> ScanResult:
        """
        Crée un ScanResult à partir d'une liste de vulnérabilités.
        """
        critical_count = sum(1 for v in vulnerabilities if v.severity == Severity.CRITICAL)
        high_count = sum(1 for v in vulnerabilities if v.severity == Severity.HIGH)
        medium_count = sum(1 for v in vulnerabilities if v.severity == Severity.MEDIUM)
        low_count = sum(1 for v in vulnerabilities if v.severity == Severity.LOW)
        
        return ScanResult(
            scan_type=ScanType.DOCKER,
            vulnerabilities=vulnerabilities,
            total_vulnerabilities=len(vulnerabilities),
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            status="completed"
        )