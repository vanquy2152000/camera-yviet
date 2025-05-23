import { instanceDefault } from "@/utils/axios/AxiosCustomize"

const apiUpload = {
    async postUploadFile(data: any): Promise<any> {
        return await instanceDefault.post("/files/upload", data)
    }
}

export default apiUpload