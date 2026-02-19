import API from "@/api/base-api";
import { EditProfileInterface } from "@/common";

export function getProfile() {
    return API.get("/users/me");
}

export function editProfileDetails(data: EditProfileInterface) {
    return API.patch("/users/me", data);
}