from typing import List, Dict, Any, Optional, Union
from flask import Blueprint, jsonify, request, Response
from dependency_injector.wiring import inject, Provider
from ..services.user_service import UserService
from ..schemas.user import UserResponse, UserCreate

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@inject
def get_users(user_service: UserService = Provider['user_service']) -> Response:
    users: List[UserResponse] = user_service.get_all_users()
    return jsonify(users)

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@inject
def get_user(
    user_id: int, 
    user_service: UserService = Provider['user_service']
) -> Union[Response, tuple[Response, int]]:
    user: Optional[UserResponse] = user_service.get_user(user_id)
    if user:
        return jsonify(user)
    return jsonify({'error': 'User not found'}), 404

@user_bp.route('/users', methods=['POST'])
@inject
def create_user(
    user_service: UserService = Provider['user_service']
) -> tuple[Response, int]:
    data: UserCreate = request.get_json()
    user: UserResponse = user_service.create_user(data)
    return jsonify(user), 201
