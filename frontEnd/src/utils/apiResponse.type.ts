export type TApiResponse<T = unknown> = {
    data: T;
    error: Error | null;
}

export type TApiListResponse<T = unknown> = {
    data: T[];
    error: Error | null;
}

export interface Error {
    message: string;
}
