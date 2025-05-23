import { instanceDefault } from "@/utils/axios/AxiosCustomize"

const apiAuth = {
    async postLogin(data: any): Promise<any> {
        return await instanceDefault.post("/auth/login", data)
    }
}

export default apiAuth