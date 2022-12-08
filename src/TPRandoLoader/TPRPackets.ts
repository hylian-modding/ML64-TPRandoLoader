import { Packet, UDPPacket } from 'modloader64_api/ModLoaderDefaultImpls';
import { SocketType } from 'modloader64_api/NetworkHandler';

export class TPR_SeedPacket extends Packet {
    seed: Buffer[];
    seedName: string[];

    constructor(seed: Buffer[], seedName: string[], lobby: string) {
        super('TPR_SeedPacket', 'TPRandoLoader', lobby, true);
        this.seed = seed;
        this.seedName = seedName;
        this.socketType = SocketType.SETUP_PACKET;
    }
}

export class TPR_SeedRequestPacket extends Packet {
    constructor(lobby: string) {
        super('TPR_SeedRequestPacket', 'TPRandoLoader', lobby, true);
        this.socketType = SocketType.SETUP_PACKET;
    }
}