export type Spot = {
    id: string;
    lat: number;
    lng: number;
    createdAt: string;
    note?: string;
    title?: string;
    photoUrl?: string;
    accuracy?: number;
    addressLabel?: string;
};