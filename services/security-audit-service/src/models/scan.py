from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ScanType(str, Enum):
    """Types de scans disponibles"""
    DEPENDENCY = "dependency"
    CODE = "code"
    DOCKER = "docker"
    ALL = "all"


class Severity(str, Enum):
    """Niveaux de sévérité"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Vulnerability(BaseModel):
    """Modèle d'une vulnérabilité détectée"""
    id: str = Field(..., description="Identifiant unique de la vulnérabilité")
    severity: Severity = Field(..., description="Niveau de sévérité")
    description: str = Field(..., description="Description de la vulnérabilité")
    affected_component: str = Field(..., description="Composant affecté")
    cve_id: Optional[str] = Field(None, description="CVE ID si disponible")
    cvss_score: Optional[float] = Field(None, description="Score CVSS si disponible")
    recommendation: Optional[str] = Field(None, description="Recommandation de correction")


class ScanResult(BaseModel):
    """Résultat d'un scan"""
    scan_type: ScanType = Field(..., description="Type de scan effectué")
    vulnerabilities: List[Vulnerability] = Field(default_factory=list, description="Liste des vulnérabilités")
    total_vulnerabilities: int = Field(0, description="Nombre total de vulnérabilités")
    critical_count: int = Field(0, description="Nombre de vulnérabilités critiques")
    high_count: int = Field(0, description="Nombre de vulnérabilités hautes")
    medium_count: int = Field(0, description="Nombre de vulnérabilités moyennes")
    low_count: int = Field(0, description="Nombre de vulnérabilités basses")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Date du scan")
    duration_seconds: Optional[float] = Field(None, description="Durée du scan en secondes")
    status: str = Field("completed", description="Statut du scan")


class ScanRequest(BaseModel):
    """Requête de scan"""
    scan_type: ScanType = Field(ScanType.ALL, description="Type de scan à effectuer")
    target: Optional[str] = Field(None, description="Cible spécifique du scan")


class ScanResponse(BaseModel):
    """Réponse après lancement d'un scan"""
    scan_id: str = Field(..., description="ID unique du scan")
    scan_type: ScanType = Field(..., description="Type de scan")
    status: str = Field(..., description="Statut du scan")
    started_at: datetime = Field(default_factory=datetime.utcnow, description="Date de début")
    message: str = Field(..., description="Message de confirmation")