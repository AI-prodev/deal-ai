import { FunnelType } from "../types/IFunnel"

export const getRequestFunnelType = (type: string | null): Record<"type", FunnelType | { $ne: FunnelType }> | NonNullable<unknown> => {
    if (!type) return {}

    if (type === FunnelType.ULTRA_FAST_FUNNEL) {
        return {
            $and: [{
                type: { $ne: FunnelType.ULTRA_FAST_WEBSITE }
            }, {
                type: { $ne: FunnelType.EASY_WEBSITES }
            }, {
                type: { $ne: FunnelType.SMART_WEBSITES }
            }, {
                type: { $ne: FunnelType.SIMPLE_WEBSITES }
            }]
        }
    }

    if (Object.values(FunnelType).includes(type as FunnelType)) {
        return { type: type as FunnelType }
    }

    return {
        $and: [{
            type: { $ne: FunnelType.ULTRA_FAST_WEBSITE }
        }, {
            type: { $ne: FunnelType.EASY_WEBSITES }
        }, {
            type: { $ne: FunnelType.SMART_WEBSITES }
        }, {
            type: { $ne: FunnelType.SIMPLE_WEBSITES }
        }]
    }
}
