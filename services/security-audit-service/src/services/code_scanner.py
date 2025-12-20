import subprocess
import json
from typing import List
from models.scan import ScanResult, Vulnerability, Severity, ScanType


class CodeScanner:
    """Scanner de code avec Bandit pour Python"""
    
    def scan_python_code(self, directory: str) -> ScanResult:
        """
        Scan du code Python avec Bandit.
        
        Args:
            directory: Répertoire à scanner
            
        Returns:
            ScanResult avec les vulnérabilités détectées
        """
        print(f"🔍 Scanning Python code in: {directory}")
        
        try:
            # Exécuter Bandit
            result = subprocess.run(
                [
                    "bandit",
                    "-r",  # Recursive
                    directory,
                    "-f", "json",  # Format JSON
                    "-ll"  # Low confidence level
                ],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            # Bandit retourne 1 si des problèmes sont trouvés
            if result.returncode in [0, 1]:
                bandit_data = json.loads(result.stdout)
                vulnerabilities = self._parse_bandit_results(bandit_data)
                return self._create_scan_result(vulnerabilities)
            
        except subprocess.TimeoutExpired:
            print("⏰ Bandit scan timeout")
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing Bandit output: {e}")
        except Exception as e:
            print(f"❌ Error running Bandit: {e}")
        
        # Fallback: retourner un résultat vide
        return ScanResult(scan_type=ScanType.CODE)
    
    def _parse_bandit_results(self, bandit_data: dict) -> List[Vulnerability]:
        """
        Parse les résultats de Bandit.
        
        Args:
            bandit_data: Données JSON de Bandit
            
        Returns:
            Liste de Vulnerability
        """
        vulnerabilities = []
        
        results = bandit_data.get("results", [])
        
        for issue in results:
            # Mapper la sévérité Bandit vers notre enum
            severity_map = {
                "HIGH": Severity.HIGH,
                "MEDIUM": Severity.MEDIUM,
                "LOW": Severity.LOW
            }
            
            severity = severity_map.get(
                issue.get("issue_severity", "LOW"),
                Severity.LOW
            )
            
            # Construire la description
            description = f"{issue.get('issue_text', 'Security issue detected')}"
            
            # Localisation du problème
            location = f"{issue.get('filename', 'unknown')}:{issue.get('line_number', 0)}"
            
            vulnerability = Vulnerability(
                id=issue.get("test_id", "BANDIT-UNKNOWN"),
                severity=severity,
                description=description,
                affected_component=location,
                recommendation=f"Review code at {location}. {issue.get('more_info', '')}"
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
            scan_type=ScanType.CODE,
            vulnerabilities=vulnerabilities,
            total_vulnerabilities=len(vulnerabilities),
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            status="completed"
        )