import { IFunnel } from "../types/IFunnel"
import { IPage } from "../types/IPage"
import PageModel from "../models/page"
import FunnelModel from "../models/funnel"
import DomainModel from "../models/domain"


export async function getFunnelAndPageFromUrl(url: string) {
    let path: string | null = null
    let page: IPage | null = null
    let funnel: IFunnel | null = null
    
    if (url.indexOf("/p/") >= 0) { // is in preview mode
        const parsedUrl = new URL(url)
        const pathComponents = parsedUrl.pathname.split("/").filter(component => component)
        const funnelId = pathComponents[1] || null
        path = pathComponents[2] || ""
        funnel = await FunnelModel.findOne({ _id: funnelId }).lean().exec()
    } else { // is in production mode
        const parsedUrl = new URL(url)
        const pathComponents = parsedUrl.pathname.split("/").filter(component => component)
        path = pathComponents[0] || ""
        const domain = await DomainModel.findOne({ domain: parsedUrl.host }).lean().exec()
        if (domain) {
            funnel = await FunnelModel.findOne({ domain: domain._id }).lean().exec()
        }
    }

    if (funnel) {
        page = await PageModel.findOne({ funnel: funnel._id, path }).lean().exec()
    }

    return {
        funnel,
        page,
        path
    }
}