import subprocess
import json
import os
from typing import List
from models.scan import ScanResult, Vulnerability, Severity, ScanType


class DependencyScanner:
    """Scanner de dépendances avec OWASP Dependency Check"""
    
    def __init__(self):
        self.owasp_command = "dependency-check"
    
    def scan_maven_project(self, pom_path: str) -> ScanResult:
        """
        Scan d'un projet Maven avec OWASP Dependency Check.
        
        Args:
            pom_path: Chemin vers le pom.xml
            
        Returns:
            ScanResult avec les vulnérabilités détectées
        """
        print(f"🔍 Scanning Maven project: {pom_path}")
        
        # Simuler un scan OWASP (à remplacer par la vraie commande)
        # En production, utiliser la vraie commande dependency-check
        vulnerabilities = self._simulate_maven_scan(pom_path)
        
        return self._create_scan_result(vulnerabilities)
    
    def scan_npm_project(self, package_json_path: str) -> ScanResult:
        """
        Scan d'un projet npm avec npm audit.
        
        Args:
            package_json_path: Chemin vers package.json
            
        Returns:
            ScanResult avec les vulnérabilités détectées
        """
        print(f"🔍 Scanning npm project: {package_json_path}")
        
        try:
            # Exécuter npm audit
            result = subprocess.run(
                ["npm", "audit", "--json"],
                cwd=os.path.dirname(package_json_path),
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode in [0, 1]:  # 0 = pas de vulnérabilités, 1 = vulnérabilités trouvées
                audit_data = json.loads(result.stdout)
                vulnerabilities = self._parse_npm_audit(audit_data)
                return self._create_scan_result(vulnerabilities)
            
        except subprocess.TimeoutExpired:
            print("⏰ npm audit timeout")
        except Exception as e:
            print(f"❌ Error running npm audit: {e}")
        
        # Fallback: retourner un résultat vide
        return ScanResult(scan_type=ScanType.DEPENDENCY)
    
    def _simulate_maven_scan(self, pom_path: str) -> List[Vulnerability]:
        """
        Simule un scan Maven pour la démonstration.
        En production, parser les résultats réels de dependency-check.
        """
        # Exemple de vulnérabilités simulées
        return [
            Vulnerability(
                id="CVE-2023-12345",
                severity=Severity.HIGH,
                description="Remote Code Execution in jackson-databind",
                affected_component="com.fasterxml.jackson.core:jackson-databind:2.13.0",
                cve_id="CVE-2023-12345",
                cvss_score=8.1,
                recommendation="Upgrade to version 2.14.0 or later"
            ),
            Vulnerability(
                id="CVE-2023-54321",
                severity=Severity.MEDIUM,
                description="SQL Injection vulnerability in hibernate-core",
                affected_component="org.hibernate:hibernate-core:5.4.0",
                cve_id="CVE-2023-54321",
                cvss_score=6.5,
                recommendation="Upgrade to version 5.6.0 or later"
            )
        ]
    
    def _parse_npm_audit(self, audit_data: dict) -> List[Vulnerability]:
        """
        Parse les résultats de npm audit.
        
        Args:
            audit_data: Données JSON de npm audit
            
        Returns:
            Liste de Vulnerability
        """
        vulnerabilities = []
        
        # Parser les vulnérabilités npm
        if "vulnerabilities" in audit_data:
            for package, vuln_data in audit_data["vulnerabilities"].items():
                severity_map = {
                    "critical": Severity.CRITICAL,
                    "high": Severity.HIGH,
                    "moderate": Severity.MEDIUM,
                    "low": Severity.LOW,
                    "info": Severity.INFO
                }
                
                severity = severity_map.get(
                    vuln_data.get("severity", "info").lower(),
                    Severity.INFO
                )
                
                vulnerability = Vulnerability(
                    id=vuln_data.get("name", package),
                    severity=severity,
                    description=vuln_data.get("title", "npm vulnerability"),
                    affected_component=f"{package}@{vuln_data.get('range', 'unknown')}",
                    cve_id=None,
                    recommendation=f"Update to: {vuln_data.get('fixAvailable', {}).get('version', 'latest')}"
                )
                vulnerabilities.append(vulnerability)
        
        return vulnerabilities
    
    def _create_scan_result(self, vulnerabilities: List[Vulnerability]) -> ScanResult:
        """
        Crée un ScanResult à partir d'une liste de vulnérabilités.
        """
        critical_count = sum(1 for v in vulnerabilities if v.severity == Severity.CRITICAL)
        high_count = sum(1 for v in vulnerabilities if v.severity == Severity.HIGH)
        medium_count = sum(1 for v in vulnerabilities if v.severity == Severity.MEDIUM)
        low_count = sum(1 for v in vulnerabilities if v.severity == Severity.LOW)
        
        return ScanResult(
            scan_type=ScanType.DEPENDENCY,
            vulnerabilities=vulnerabilities,
            total_vulnerabilities=len(vulnerabilities),
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            status="completed"
        )