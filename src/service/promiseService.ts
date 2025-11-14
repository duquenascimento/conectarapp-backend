interface PendingRequest {
    resolve: (data: any) => void
    reject: (error: any) => void
}

export const pendingRequests = new Map<string, PendingRequest>()

export const addPendingRequest = (requestId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        pendingRequests.set(requestId, { resolve, reject })
    })
}

export const resolvePendingRequest = (requestId: string, data: any) => {
    const pending = pendingRequests.get(requestId)
    if (pending) {
        pending.resolve(data)
        pendingRequests.delete(requestId)
    }
}

export const rejectPendingRequest = (requestId: string, error: any) => {
    const pending = pendingRequests.get(requestId)
    if (pending) {
        pending.reject(error)
        pendingRequests.delete(requestId)
    }
}
