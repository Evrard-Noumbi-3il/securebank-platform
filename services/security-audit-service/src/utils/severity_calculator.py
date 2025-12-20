from typing import List
from models.scan import ScanResult, Severity
from models.report import SecurityScore


class SeverityCalculator:
    """Calculateur de score de sécurité"""
    
    # Poids pour chaque niveau de sévérité
    WEIGHTS = {
        Severity.CRITICAL: 10,
        Severity.HIGH: 5,
        Severity.MEDIUM: 2,
        Severity.LOW: 1,
        Severity.INFO: 0
    }
    
    @staticmethod
    def calculate_score(scan_results: List[ScanResult]) -> SecurityScore:
        """
        Calcule le score de sécurité basé sur les résultats de scans.
        
        Score = 100 - (somme des vulnérabilités pondérées)
        
        Args:
            scan_results: Liste des résultats de scans
            
        Returns:
            SecurityScore avec le score calculé et les détails
        """
        total_penalty = 0
        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0
        
        # Parcourir tous les résultats de scan
        for result in scan_results:
            for vulnerability in result.vulnerabilities:
                severity = vulnerability.severity
                penalty = SeverityCalculator.WEIGHTS.get(severity, 0)
                total_penalty += penalty
                
                # Compter par sévérité
                if severity == Severity.CRITICAL:
                    critical_count += 1
                elif severity == Severity.HIGH:
                    high_count += 1
                elif severity == Severity.MEDIUM:
                    medium_count += 1
                elif severity == Severity.LOW:
                    low_count += 1
        
        # Calculer le score (minimum 0, maximum 100)
        score = max(0, 100 - total_penalty)
        
        # Déterminer la note
        grade = SeverityCalculator._calculate_grade(score)
        
        return SecurityScore(
            score=score,
            grade=grade,
            critical_issues=critical_count,
            high_issues=high_count,
            medium_issues=medium_count,
            low_issues=low_count
        )
    
    @staticmethod
    def _calculate_grade(score: int) -> str:
        """
        Convertit un score en note alphabétique.
        
        Args:
            score: Score de 0 à 100
            
        Returns:
            Note de A à F
        """
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def get_recommendations(security_score: SecurityScore) -> List[str]:
        """
        Génère des recommandations basées sur le score de sécurité.
        
        Args:
            security_score: Score de sécurité calculé
            
        Returns:
            Liste de recommandations
        """
        recommendations = []
        
        if security_score.critical_issues > 0:
            recommendations.append(
                f"🚨 URGENT: {security_score.critical_issues} vulnérabilité(s) CRITIQUE(s) détectée(s). "
                "Correction immédiate requise avant tout déploiement."
            )
        
        if security_score.high_issues > 0:
            recommendations.append(
                f"⚠️ {security_score.high_issues} vulnérabilité(s) HAUTE(s) détectée(s). "
                "Planifier la correction dans les prochains jours."
            )
        
        if security_score.medium_issues > 5:
            recommendations.append(
                f"📋 {security_score.medium_issues} vulnérabilités moyennes détectées. "
                "Planifier une revue de sécurité complète."
            )
        
        if security_score.score < 70:
            recommendations.append(
                "📊 Score de sécurité faible. Effectuer un audit de sécurité complet "
                "et mettre en place un plan d'action prioritaire."
            )
        
        if security_score.score >= 90:
            recommendations.append(
                "✅ Excellent score de sécurité ! Maintenir les bonnes pratiques "
                "et effectuer des scans réguliers."
            )
        
        # Recommandations générales
        if not recommendations:
            recommendations.append(
                "🔍 Continuer à effectuer des scans de sécurité réguliers "
                "et maintenir les dépendances à jour."
            )
        
        return recommendations