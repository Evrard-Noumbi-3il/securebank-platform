from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import time
import uuid
from models.scan import ScanRequest, ScanResponse, ScanResult, ScanType
from services.dependency_scanner import DependencyScanner
from services.code_scanner import CodeScanner
from services.docker_scanner import DockerScanner
from services.report_service import ReportService

router = APIRouter(prefix="/scan", tags=["Scan"])

# Services
dependency_scanner = DependencyScanner()
code_scanner = CodeScanner()
docker_scanner = DockerScanner()
report_service = ReportService()

# Storage des scans en cours (en production, utiliser Redis ou DB)
active_scans = {}


@router.post("", response_model=ScanResponse, summary="Lancer un scan de sécurité")
async def start_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks
):
    """
    Lance un scan de sécurité asynchrone.
    
    - **scan_type**: Type de scan (dependency, code, docker, all)
    - **target**: Cible optionnelle (ex: nom d'image Docker)
    
    Retourne immédiatement un ID de scan pour suivre la progression.
    """
    scan_id = str(uuid.uuid4())
    
    # Enregistrer le scan
    active_scans[scan_id] = {
        "status": "running",
        "scan_type": scan_request.scan_type,
        "started_at": time.time()
    }
    
    # Lancer le scan en arrière-plan
    background_tasks.add_task(
        execute_scan,
        scan_id,
        scan_request.scan_type,
        scan_request.target
    )
    
    return ScanResponse(
        scan_id=scan_id,
        scan_type=scan_request.scan_type,
        status="running",
        message=f"Scan {scan_request.scan_type.value} lancé avec succès"
    )


@router.get("/{scan_id}", response_model=dict, summary="Obtenir le statut d'un scan")
async def get_scan_status(scan_id: str):
    """
    Récupère le statut et les résultats d'un scan.
    
    - **scan_id**: ID du scan à consulter
    
    Retourne le statut actuel et les résultats si terminé.
    """
    if scan_id not in active_scans:
        raise HTTPException(status_code=404, detail="Scan non trouvé")
    
    scan_data = active_scans[scan_id]
    
    response = {
        "scan_id": scan_id,
        "status": scan_data["status"],
        "scan_type": scan_data["scan_type"].value if isinstance(scan_data["scan_type"], ScanType) else scan_data["scan_type"]
    }
    
    # Ajouter les résultats si terminé
    if scan_data["status"] == "completed" and "results" in scan_data:
        response["results"] = scan_data["results"]
        response["report_id"] = scan_data.get("report_id")
    
    # Ajouter l'erreur si échec
    if scan_data["status"] == "failed" and "error" in scan_data:
        response["error"] = scan_data["error"]
    
    return response


async def execute_scan(scan_id: str, scan_type: ScanType, target: str = None):
    """
    Exécute le scan en arrière-plan.
    
    Args:
        scan_id: ID du scan
        scan_type: Type de scan à effectuer
        target: Cible optionnelle
    """
    try:
        print(f"🚀 Executing scan {scan_id} of type {scan_type}")
        
        scan_results: List[ScanResult] = []
        
        # Exécuter les scans selon le type
        if scan_type == ScanType.DEPENDENCY or scan_type == ScanType.ALL:
            # Scanner les projets Maven dans services/
            maven_result = dependency_scanner.scan_maven_project("/app/services/auth-service/pom.xml")
            scan_results.append(maven_result)
        
        if scan_type == ScanType.CODE or scan_type == ScanType.ALL:
            # Scanner le code Python
            python_result = code_scanner.scan_python_code("/app/src")
            scan_results.append(python_result)
        
        if scan_type == ScanType.DOCKER or scan_type == ScanType.ALL:
            # Scanner l'image Docker spécifiée ou l'image par défaut
            image = target if target else "auth-service:latest"
            docker_result = docker_scanner.scan_docker_image(image)
            scan_results.append(docker_result)
        
        # Créer un rapport
        report = report_service.create_report(scan_results)
        
        # Mettre à jour le statut
        active_scans[scan_id]["status"] = "completed"
        active_scans[scan_id]["results"] = [r.dict() for r in scan_results]
        active_scans[scan_id]["report_id"] = report.id
        
        print(f"✅ Scan {scan_id} completed successfully")
        
    except Exception as e:
        print(f"❌ Scan {scan_id} failed: {str(e)}")
        active_scans[scan_id]["status"] = "failed"
        active_scans[scan_id]["error"] = str(e)