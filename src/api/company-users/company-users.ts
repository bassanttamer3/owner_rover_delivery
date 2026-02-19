import API from "@/api/base-api";
import { EditUserDataInterface, ListCompanyUsersInterface, NewCompanyUserInterface } from "@/common";

export function listCompanyUsers(params: ListCompanyUsersInterface) {
  return API.get("/users", { params });
}

export function createCompanyUser(data: NewCompanyUserInterface) {
  return API.post("/users", data);
}

export function getUserDetails(id: string) {
  return API.get(`/users/${id}`);
}

export function editUserData(user_id: string, data: EditUserDataInterface) {
  return API.patch(`/users/${user_id}`, data);
}

export function deactivateCompanyUser(id: string) {
  return API.delete(`/users/${id}`);
}

export function activateCompanyUser(id: string) {
  return API.post(`/users/${id}/reactivate`);
}

