from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime
from .scan import ScanResult


class SecurityScore(BaseModel):
    """Score de sécurité global"""
    score: int = Field(..., ge=0, le=100, description="Score de 0 à 100")
    grade: str = Field(..., description="Note (A, B, C, D, F)")
    critical_issues: int = Field(0, description="Nombre de problèmes critiques")
    high_issues: int = Field(0, description="Nombre de problèmes hauts")
    medium_issues: int = Field(0, description="Nombre de problèmes moyens")
    low_issues: int = Field(0, description="Nombre de problèmes bas")


class SecurityReport(BaseModel):
    """Rapport de sécurité complet"""
    id: str = Field(..., description="ID unique du rapport")
    score: SecurityScore = Field(..., description="Score de sécurité")
    scan_results: List[ScanResult] = Field(default_factory=list, description="Résultats des scans")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    summary: str = Field(..., description="Résumé du rapport")
    recommendations: List[str] = Field(default_factory=list, description="Recommandations")
    total_vulnerabilities: int = Field(0, description="Total vulnérabilités détectées")


class ReportListItem(BaseModel):
    """Item de la liste des rapports"""
    id: str = Field(..., description="ID du rapport")
    score: int = Field(..., description="Score de sécurité")
    grade: str = Field(..., description="Note")
    created_at: datetime = Field(..., description="Date de création")
    total_vulnerabilities: int = Field(..., description="Total vulnérabilités")


class ReportList(BaseModel):
    """Liste des rapports"""
    reports: List[ReportListItem] = Field(default_factory=list)
    total: int = Field(0, description="Nombre total de rapports")