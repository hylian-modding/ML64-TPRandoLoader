import { IModLoaderAPI, IPlugin } from 'modloader64_api/IModLoaderAPI';
import { SidedProxy, ProxySide } from 'modloader64_api/SidedProxy/SidedProxy';
import fs from "fs";
import nodeFetch from "node-fetch";
import path from "path";
import { bus, EventHandler, EventsClient } from 'modloader64_api/EventHandler';
import { NetworkHandler } from 'modloader64_api/NetworkHandler';
import { TPR_SeedPacket, TPR_SeedRequestPacket } from './TPRPackets';
import { LobbyData } from 'modloader64_api/NetworkHandler';

class TPRandoLoader implements IPlugin {

    ModLoader!: IModLoaderAPI;
    randomizerGCI!: Buffer;
    relLoaderGECKO!: Buffer;
    gameIniPath: string = "./data/dolphin/GameSettings/GZ2E01.ini";
    seedBuf: Buffer[] = [];
    seedContent: string[] = [];
    saveContent: string[] = [];
    hasRecieved = false;

    preinit() {
        if (!fs.existsSync('tpr')) {
            fs.mkdirSync(`tpr`);
        } if (!fs.existsSync('tpr/seeds')) {
            fs.mkdirSync(`tpr/seeds`);
        } if (!fs.existsSync('./saves')) {
            fs.mkdirSync(`./saves`);
        } if (!fs.existsSync(`./saves/${this.ModLoader.clientLobby}`)) {
            fs.mkdirSync(`./saves/${this.ModLoader.clientLobby}`);
        } if (!fs.existsSync(`./data/dolphin/GameSettings`)) {
            if (!fs.existsSync(`./data`)) fs.mkdirSync(`./data`);
            if (!fs.existsSync(`./data/dolphin`)) fs.mkdirSync(`./data/dolphin`);
            if (!fs.existsSync(`./data/dolphin/GameSettings`)) fs.mkdirSync(`./data/dolphin/GameSettings`);
            fs.writeFileSync(this.gameIniPath, Buffer.alloc(0));
        }

        let contents: string[] = fs.readdirSync('./tpr');
        this.seedContent = fs.readdirSync('./tpr/seeds');
        this.saveContent = fs.readdirSync(`./saves/${this.ModLoader.clientLobby}/`);
        let gameIni = fs.readFileSync(this.gameIniPath, "utf8")
        let newGameIni = gameIni;

        if (contents.includes("Randomizer.us.gci")) {
            console.log("Randomizer.us.gci exists!")
            this.randomizerGCI = fs.readFileSync("./tpr/Randomizer.us.gci");
        } else {
            console.log("Randomizer.us.gci not found! Please aquire this file from `https://tprandomizer.com/downloads/` !");
        }

        if (contents.includes("REL_Loader.txt")) {
            console.log("REL_Loader.txt exists!")
            this.relLoaderGECKO = fs.readFileSync("./tpr/REL_Loader.txt");
        } else {
            console.log("REL_Loader.txt not found! Please aquire this file from `https://wiki.tprandomizer.com/index.php?title=REL_Loader` !");
        }

        console.log("Cleaning old seeds from lobby...")
        for (let i = 0; i < this.saveContent.length; i++) {
            if (this.saveContent[i].includes('Tpr')) {
                if (!this.seedContent.includes(this.saveContent[i])) {
                    fs.unlinkSync(`./saves/${this.ModLoader.clientLobby}/${this.saveContent[i]}`);
                }
            }
        }

        for (let i = 0; i < this.seedContent.length; i++) {
            if (this.seedContent[i].includes('Tpr')) {
                this.seedBuf.push(fs.readFileSync(`./tpr/seeds/${this.seedContent[i]}`));
                fs.writeFileSync(`./saves/${this.ModLoader.clientLobby}/${this.seedContent[i]}`, this.seedBuf[i]);
                console.log(`Transferred seed ${this.seedContent[i]} to lobby ${this.ModLoader.clientLobby}`);
            }

            if (this.randomizerGCI !== undefined) {
                if (!fs.existsSync(`./saves/${this.ModLoader.clientLobby}`)) {
                    fs.mkdirSync(`./saves/${this.ModLoader.clientLobby}`);
                }
                fs.writeFileSync(`./saves/${this.ModLoader.clientLobby}/Randomizer.us.gci`, this.randomizerGCI)
            } else {
                console.log("Randomizer.us.gci not found! Please aquire this file from `https://tprandomizer.com/downloads/` !");
            }

            let relLoader = this.relLoaderGECKO.toString();
            let geckoEnabledIndex = newGameIni.indexOf("[Gecko_Enabled]");
            let geckoIndex = newGameIni.indexOf("[Gecko]");
            if (!gameIni.includes(relLoader)) {
                if (geckoIndex > -1) {
                    gameIni = gameIni.replace(gameIni.slice(geckoIndex + 7, geckoEnabledIndex), "\n");
                }
                console.log("Adding REL Loader to GZ2E01.ini");
                newGameIni = gameIni.concat(`\n[Gecko]\n${relLoader}\n`)
            }

            if (geckoEnabledIndex > -1) {
                if (newGameIni.lastIndexOf(`$REL Loader v2`) < geckoEnabledIndex) {
                    console.log("Enabling REL Loader v2");
                    newGameIni = newGameIni.concat("\n$REL Loader v2");
                } else console.log("REL Loader v2 is already enabled!");
            } else {
                console.log("Adding \"[Gecko_Enabled] $REL Loader v2\"")
                newGameIni = newGameIni.concat("\n[Gecko_Enabled]\n$REL Loader v2");
            }
            fs.writeFileSync(this.gameIniPath, newGameIni);
        }
    }

    download(file: string, url: string, path: string) {
        const res = nodeFetch(url).then(res => res.buffer()).then(buffer => {
            fs.writeFileSync(`./saves/${this.ModLoader.clientLobby}/${file}`, buffer)
            fs.writeFileSync(`./tpr/${file}`, buffer)
        }).catch((err: any) => {
            console.log(`Failed to download ${file}! Please manually aquire the file or try again later. ${err}`);
        })
    }

    init() {
    }

    postinit() {
        this.ModLoader.emulator.invalidateCachedCode();
    }

    onTick() {
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onJoinedLobby(lobby: LobbyData): void {
        if (this.ModLoader.clientSide.getLobbyOwner(this.ModLoader.clientLobby).uuid !== this.ModLoader.me.uuid && this.ModLoader.clientSide.getLobbyOwner(this.ModLoader.clientLobby) !== undefined) {
            this.ModLoader.clientSide.sendPacket(new TPR_SeedRequestPacket(this.ModLoader.clientLobby));
            console.log("Asking for TPR Seeds...");
            global.ModLoader.startupDelay++
        }
    }

    @NetworkHandler('TPR_SeedRequestPacket')
    onSeedRequest(packet: TPR_SeedRequestPacket) {
        this.ModLoader.clientSide.sendPacketToSpecificPlayer(
            new TPR_SeedPacket(
                this.seedBuf,
                this.seedContent,
                this.ModLoader.clientLobby), packet.player);
    }

    @NetworkHandler('TPR_SeedPacket')
    onSeed(packet: TPR_SeedPacket) {
        if (!this.hasRecieved) {
            console.log("Obtaining TPR Seeds...");
            for (let i = 0; i < packet.seed.length; i++) {
                console.log(`Obtained ${packet.seedName[i]}`);
                fs.writeFileSync(`./saves/${this.ModLoader.clientLobby}/${packet.seedName[i]}`, packet.seed[i]);
            }
            global.ModLoader.startupDelay--
            this.hasRecieved = true;
        }
    }

}

module.exports = TPRandoLoader;