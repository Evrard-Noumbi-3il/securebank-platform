from fastapi import APIRouter, HTTPException, Query
from models.report import SecurityReport, ReportList
from services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

# Service
report_service = ReportService()


@router.get("", response_model=ReportList, summary="Lister tous les rapports")
async def list_reports(
    limit: int = Query(10, ge=1, le=100, description="Nombre maximum de rapports")
):
    """
    Liste tous les rapports de sécurité (les plus récents en premier).
    
    - **limit**: Nombre maximum de rapports à retourner (1-100)
    
    Retourne une liste de rapports avec leur score et date.
    """
    return report_service.list_reports(limit=limit)


@router.get("/{report_id}", response_model=SecurityReport, summary="Obtenir un rapport détaillé")
async def get_report(report_id: str):
    """
    Récupère un rapport de sécurité détaillé par son ID.
    
    - **report_id**: ID unique du rapport
    
    Retourne le rapport complet avec:
    - Score de sécurité (/100)
    - Résultats détaillés de tous les scans
    - Liste de toutes les vulnérabilités
    - Recommandations d'action
    """
    try:
        report = report_service.get_report(report_id)
        return report
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Rapport {report_id} non trouvé"
        )


@router.delete("/{report_id}", summary="Supprimer un rapport")
async def delete_report(report_id: str):
    """
    Supprime un rapport de sécurité.
    
    - **report_id**: ID du rapport à supprimer
    
    Retourne un message de confirmation.
    """
    deleted = report_service.delete_report(report_id)
    
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Rapport {report_id} non trouvé"
        )
    
    return {
        "message": f"Rapport {report_id} supprimé avec succès",
        "deleted": True
    }