import uuid
from typing import List, Dict
from datetime import datetime
from models.scan import ScanResult
from models.report import SecurityReport, SecurityScore, ReportListItem, ReportList
from utils.severity_calculator import SeverityCalculator


class ReportService:
    """Service de gestion des rapports de sécurité"""
    
    def __init__(self):
        # Storage en mémoire (en production, utiliser une vraie DB)
        self.reports: Dict[str, SecurityReport] = {}
    
    def create_report(self, scan_results: List[ScanResult]) -> SecurityReport:
        """
        Crée un rapport de sécurité à partir des résultats de scans.
        
        Args:
            scan_results: Liste des résultats de scans
            
        Returns:
            SecurityReport créé
        """
        # Générer un ID unique
        report_id = str(uuid.uuid4())
        
        # Calculer le score de sécurité
        security_score = SeverityCalculator.calculate_score(scan_results)
        
        # Générer des recommandations
        recommendations = SeverityCalculator.get_recommendations(security_score)
        
        # Calculer le total de vulnérabilités
        total_vulnerabilities = sum(
            result.total_vulnerabilities for result in scan_results
        )
        
        # Générer le résumé
        summary = self._generate_summary(security_score, scan_results)
        
        # Créer le rapport
        report = SecurityReport(
            id=report_id,
            score=security_score,
            scan_results=scan_results,
            summary=summary,
            recommendations=recommendations,
            total_vulnerabilities=total_vulnerabilities
        )
        
        # Sauvegarder en mémoire
        self.reports[report_id] = report
        
        return report
    
    def get_report(self, report_id: str) -> SecurityReport:
        """
        Récupère un rapport par son ID.
        
        Args:
            report_id: ID du rapport
            
        Returns:
            SecurityReport trouvé
            
        Raises:
            KeyError: Si le rapport n'existe pas
        """
        if report_id not in self.reports:
            raise KeyError(f"Report {report_id} not found")
        
        return self.reports[report_id]
    
    def list_reports(self, limit: int = 10) -> ReportList:
        """
        Liste tous les rapports (les plus récents en premier).
        
        Args:
            limit: Nombre maximum de rapports à retourner
            
        Returns:
            ReportList avec la liste des rapports
        """
        # Trier par date décroissante
        sorted_reports = sorted(
            self.reports.values(),
            key=lambda r: r.created_at,
            reverse=True
        )
        
        # Limiter le nombre de résultats
        limited_reports = sorted_reports[:limit]
        
        # Créer les items de liste
        report_items = [
            ReportListItem(
                id=report.id,
                score=report.score.score,
                grade=report.score.grade,
                created_at=report.created_at,
                total_vulnerabilities=report.total_vulnerabilities
            )
            for report in limited_reports
        ]
        
        return ReportList(
            reports=report_items,
            total=len(self.reports)
        )
    
    def delete_report(self, report_id: str) -> bool:
        """
        Supprime un rapport.
        
        Args:
            report_id: ID du rapport à supprimer
            
        Returns:
            True si supprimé, False sinon
        """
        if report_id in self.reports:
            del self.reports[report_id]
            return True
        return False
    
    def _generate_summary(
        self, 
        security_score: SecurityScore, 
        scan_results: List[ScanResult]
    ) -> str:
        """
        Génère un résumé textuel du rapport.
        
        Args:
            security_score: Score de sécurité calculé
            scan_results: Résultats des scans
            
        Returns:
            Résumé textuel
        """
        total_scans = len(scan_results)
        total_vulns = sum(r.total_vulnerabilities for r in scan_results)
        
        summary_parts = [
            f"Scan de sécurité effectué sur {total_scans} composant(s).",
            f"Score global: {security_score.score}/100 (Grade: {security_score.grade}).",
            f"Total de {total_vulns} vulnérabilité(s) détectée(s):"
        ]
        
        if security_score.critical_issues > 0:
            summary_parts.append(
                f"  - {security_score.critical_issues} CRITIQUE(s) ⚠️"
            )
        
        if security_score.high_issues > 0:
            summary_parts.append(
                f"  - {security_score.high_issues} HAUTE(s) ⚠️"
            )
        
        if security_score.medium_issues > 0:
            summary_parts.append(
                f"  - {security_score.medium_issues} MOYENNE(s)"
            )
        
        if security_score.low_issues > 0:
            summary_parts.append(
                f"  - {security_score.low_issues} BASSE(s)"
            )
        
        # Ajouter des infos par type de scan
        scan_types = [r.scan_type.value for r in scan_results]
        summary_parts.append(f"\nTypes de scans effectués: {', '.join(scan_types)}")
        
        return " ".join(summary_parts)