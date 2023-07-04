# ML64-TPRandoLoader
 An ML64 companion mod for [Twilight Princess Randomizer](https://tprandomizer.com/)

 # Usage
 Upon first booting, the mod expects a folder structure in the running directory like so: 

 ```
tpr
├── seeds
│     └── [seedName].gci
└── Randomizer.us.gci
└── REL_Loader.txt
 ```
 
 If the mod does not detect these folders, it will generate them automatically. Furthermore, if the "Randomizer.us.gci" file, or the "REL_Loader.txt" file is not found, you will need to download them from TPR's official pages: [Randomizer](https://tprandomizer.com/downloads/) & [REL_Loader Gecko Code](https://wiki.tprandomizer.com/index.php?title=REL_Loader). 
 MAKE SURE TO RENAME THESE FILES TO "Randomizer.us.gci" & "REL_Loader.txt" RESPECTIVELY! The TPR seeds themselves must be also manually placed into the seeds folder.

#
 When loading your game, TPRandoLoader will auto-enable the REL Loader via the embedded Gecko Code. 
 - If you are running this mod alongside [Twilight Princess Online](https://github.com/hylian-modding/TwilightPrincessOnline), TPRandoLoader will also sync the lobby host's TPR seeds between all players. This ensures that players will be able to play the same TPR seeds cooperatively in Twilight Princess Online without needing to do any extra work on their own end.
