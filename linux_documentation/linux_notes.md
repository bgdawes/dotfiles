# Linux Notes

Contents

1. [Arch Linux Install - PC Build](#archlinuxinstallpcbuild)
2. [General recommendations](#generalrecommendations)
3. [General Linux Commands](#generallinuxcommands)
4. [Git](#git)
5. [aurutils](#aurutils)
6. [pandoc](#pandoc)
7. [vpn](#vpn)
8. [Rsync & SSH](#rsyncssh)
9. [Synergy](#synergy)
10. [Stow](#stow)
11. [RetroArch](#retroarch)

Appendix

## Arch Linux Install - PC Build {#archlinuxinstallpcbuild}

### Boot archiso from USB

Two different options were available with this release. Selected the option that specifies 'Partition 1 UEFI'.

### Verify boot mode

- Verify UEFI boot mode  
    `# ls /sys/firmware/efi/efivars`  

- The directory should exist and return a bunch of files  

### Connect to the Innernette  

#### This section is likely outdated (replaced with iwctl)

- Type the following command below to view devices  
    `# ip link`  

- Ethernet devices should begin with the letter 'E' and wireless devices should begin with the letter 'W'[^1]
  
- Type the following command to connect to a wireless access point:  
    `# wifi-menu -o wlp#s0`  
  
- The system will scan for available networks and provide a menu to select a network. Select the appropriate network, use the default name for the new profile (automatically populated), and enter network password when prompted.  
  
- Ping google to verify connection:  
    `# ping -c 3 google.com`  
  
- Verify a configuration file was created by typing the following command:  
    `# ls /etc/netctl`  
  
- You should 'hopefully' see a file called 'wlp#s0-WIFINETWORKNAME'; you can look at the file by typing the following command:  
    `# nano /etc/netctl/wlp#s0-WIFINETWORKNAME`  

### Update the system clock  

`# timedatectl set-ntp true`  

### View existing drive setup  

`# lsblk`  
sda - SSD 240 GB | System drive [pc build setup]  
sdb - SSD 480 GB | Storage drive [pc build setup]  

### Zap and partition drives  

- `# gdisk /dev/sda`  

- Press x to enter expert mode. Then press z to zap the drive. Hit y when prompted about wiping out GPT and blanking out MBR.  

- Repeat steps above for additional drives.  

### Create primary drive partitions  

- Enter the following command:  
    `# cgdisk`  

- You may be asked to enter the device name of the drive:  
    `/dev/sda`  

- You then may hit a warning screen - just hit a key to proceed.

#### Create boot partition

- Hit New from the options at the bottom.  

- Hit enter to select the default option for the first sector.  

- Select partition size - Arch wiki recommends 200-300 MB for the boot size. Make it 512MiB just to be safe. Hit enter.  

- Set GUID to EF00. Hit enter.  

- Set name to 'boot'. Hit enter.  

- Now you should see the new partition in the partitions list with a  partition type of EFI System and a partition name of boot. You will also  notice there is 1007KB above the created partition. That is the MBR.  Don't worry about that and just leave it there. [^2]

#### Create swap partition

- Hit New again from the options at the bottom of partition list.  

- Hit enter to select the default option for the first sector.  

- Assign swap space, for RAM between 8GB – 64GB the rule of thumb is to use 1.5 times the amount of RAM for swap space [^3] [^4]; however, for this desktop installation, I only used 18 GB for SWAP as I don't expect to hibernate often.  

- Set GUID to 8200. Hit enter.  

- Set name to swap. Hit enter.  

- Now you should see the new partition in the partitions list with a partition type of Linux swap and a partition name of swap.  
  
#### Create root partition

- Hit New again from the options at the bottom of partition list.  

- Hit enter to select the default option for the first sector.  

- Hit enter again to use the remainder of the disk.  

- Hit enter for the GUID to select default.  

- Set name of the partition to root.  

#### Write root partition

Hit Write at the bottom of the partitions list to write the changes to  the disk. Type yes to confirm the write command. Now we are done partitioning the disk. Hit Quit to exit cgdisk.  

#### Create partitions for additional drives  

- Enter the following command:  
    `# cgdisk`  

- Enter the device filename of your 2nd drive by typing the name of the main drive you identified above:  
    `/dev/sdb`  

#### Create storage partition

- Hit New again from the options at the bottom of partition list.  

- Hit enter to select the default option for the first sector.  

- Hit enter again to use the remainder of the disk.  

- Hit enter for the GUID to select default.  

- Set name of the partition to storage.  

#### Write storage partition

Hit Write at the bottom of the partitions list to write the changes to  the disk. Type yes to confirm the write command. Now we are done  partitioning the disk. Hit Quit to exit cgdisk.  
  
### Format and enable partitions  

- Format the boot partition as FAT32:  
    `# mkfs.fat -F32 /dev/sda1`  

- Enable the swap partition:  
    `# mkswap /dev/sda2`  
    `# swapon /dev/sda2`  

- Format root partition as ext4:  
    `# mkfs.ext4 /dev/sda3`  

- Wait for command to complete.

- Confirm formatting and swap mountpoint by typing the following command:  
    `# lsblk`  

- Format 2nd drive partition as ext4:  
    `# mkfs.ext4 /dev/sdb1`  

### Mount partitions  

- Mount the root partition by typing the following commands (you may receive this error: cannot create directory /mnt: file exists, it's ok):  
    `# mkdir /mnt`  

- Mount root  
    `# mount /dev/sda3 /mnt`  

- Mount the boot partition by typing the following commands:  
    `# mkdir /mnt/boot`  
    `# mount /dev/sda1 /mnt/boot`  

- Mount storage partition by typing the following commands:  
    `# mkdir /mnt/storage`  
    `# mount /dev/sdb1 /mnt/storage`  

I temporarily have the additional drive mounted at `/mnt/storage`. Later, I edited the fstab file to mount the additional drive as displayed below (from current fstab file):  

```bash
#
# /etc/fstab: static file system information
#
# <file system> <dir> <type> <options> <dump> <pass>
# /dev/sda3
UUID=6a5b8ffa-d065-4cd4-9a5a-5a6258829c2c / ext4 rw,relatime,data=ordered 0 1
  
# /dev/sda1
UUID=229C-9EC2 /boot vfat rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=iso8859-1,shortname=mixed,errors=remount-ro 0 2
  
# /dev/sdb1
UUID=e074688a-5173-4f7c-814f-2e86b2589ea8 /home/bgdawes/storage ext4 rw,relatime,data=ordered 0 2

# /dev/sda2
UUID=2cff430b-b3e6-4718-85c3-673cecf0c9e4 none swap defaults 0 0
```

### Install Arch Linux

- Type the following command to install base packages:  
    `# pacstrap -i /mnt base base-devel`  

- Just hit enter/yes for all the prompts that come up. Wait for Arch to finish installing the base and base-devel packages.  

- Generate the genfstab file by typing the following command:  
    `# genfstab -U /mnt >> /mnt/etc/fstab`  

- Copy the config files in the /etc/netctl to the new system in /mnt  
    `# cp /etc/netctl/wlp#s0-WIFINETWORKNAME /mnt/etc/netctl`  

- chroot to the newly installed system:  
    `# arch-chroot /mnt /bin/bash`  

- The command line prefix should change from 'root@archiso ~ #' to [root@archiso /]#  

### Configure regional settings

- Edit Locale file by typing the following command:  
    `# nano /etc/locale.gen`  

- Uncomment en_US.UTF-8 UTF-8 [remove the hashtag '#']  

- Write file [Ctrl+O]; hit enter after [Ctrl+O]  

- Exit Nano [Ctrl+X]  

- Type the following commands:  
    `# locale-gen`  
    `# echo 'LANG=en_US.UTF-8' > /etc/locale.conf`  
    `# export LANG=en_US.UTF-8`  

- List time zones by typing the following command:  
    `# ls /usr/share/zoneinfo/`  

- Set time zone by typing the following command:  
    `# ln -s /usr/share/zoneinfo/America/Chicago /etc/localtime`  

- Got error message - failed to create symbolic link /etc/localtime: file exists  

- It is recommended to adjust the time skew, and set the time standard to UTC. To do this, type the following command:  
    `# hwclock --systohc --utc`  

### Final configurations

- Generate the initramfs image by typing the following command:  
    `# mkinitcpio -p linux`  

- Set the hostname by typing the following command:  
    `# echo 'symphonic' > /etc/hostname`  

- If installing on a wireless connection, install iw, wpa_supplicant, and (for wifi-menu) dialog by typing the following command:  
    `# pacman -S iw wpa_supplicant dialog wpa_actiond`  

- Enable wireless connection by typing the following command:  
    `# systemctl enable netctl-auto@wlp#s0.service`  

- Double check pacman.conf to make sure core, extra, and community repos are not commented out:  
    `# nano /etc/pacman.conf`  

- Set password for root by typing the following command:  
    `# passwd`  

- Add a new user with username bgdawes by typing the following command:  
    `# useradd -m -g users -G wheel -s /bin/bash bgdawes`  

- Set password for bgdawes by typing the following command:  
    `# passwd bgdawes`  

- Add the new user to sudoers by typing the following commands:  
    `EDITOR=nano visudo`  
    `Uncomment # %wheel ALL=(ALL) ALL`  

- Save file [Ctrl+O]; hit enter after [Ctrl+O]; Exit Nano [Ctrl+X]  

- Install the boot loader by typing the following command:  
    `# bootctl install`  

- Create a boot entry /boot/loader/entries/arch.conf by typing the following command:  
    `# nano /boot/loader/entries/arch.conf`  

- Enter the following data for the file and then save the file:  

    ```bash
    title Arch Linux
    linux /vmlinuz-linux
    initrd /initramfs-linux.img
    options root=/dev/sda3 rw
    ```

- Save file [Ctrl+O]; hit enter after [Ctrl+O]  

- Exit Nano [Ctrl+X]  

- Type 'exit', remove USB drive, and then type 'reboot'.  

---

## General recommendations {#generalrecommendations}

### Install XDG user directories, Xorg Display Server, Display Manager, and Desktop Environment

- Log in as you.  

- Force repos to sync:  
    `# pacman -Syy`  

- Force repos to update:  
    `# pacman -Syu`  

#### XDG user directories

- Install xdg-user-dirs
    `# pacman -S xdg-user-dirs`

- To confirm no files exist on the current system type `ls` and you won't see anything.  
    Create default home folders by running `xdg-user-dirs` by typing the following command:  
    `$ xdg-user-dirs-update`  
    Type ls again to see the new folders that were created.  

#### Xorg Display Server

The `xorg` package group should be the only package you need to install to get a working Xorg installation on the system. `xorg-xinit` is only needed if you intend to start the X server manually, without a display manager. I prefer using display managers.

- Install xorg
    `# pacman -S xorg`  

#### Display Manager / Desktop Environment (XFCE / LightDM)

- Install DE, in this case, XFCE by typing the following command:  
    `# pacman -S xfce4 xfce4-goodies`  

- Install DM, in this case, LightDM Display Manager by typing the following command:  
    `# pacman -S lightdm-gtk-greeter`  

- Install LightDM settings editor by typing the following command:  
    `# pacman -S lightdm-gtk-greeter-settings`  

- Enable DM automatic startup by typing the following command:  
    `# systemctl enable lightdm.service`  

- Reboot and go!  

#### Display Manager / Desktop Environment (KDE / SDDM)

- Install KDE Plasma group  
    `# pacman -S plasma`  

- Install KDE Applications group  
    `# pacman -S kde-applications`  

- Install DM, in this case, SDDM by typing the following command:  
    `# pacman -S SDDM`  

- Enable DM automatic startup by typing the following command:  
    `# systemctl enable sddm.service`  

- Reboot and go!

### Other Tips  

#### Set up time  

`# timedatectl set-timezone America/Chicago`  

#### As needed, chown additional storage drives[^5]

`# chown -R bgdawes:users /storage`

#### Install 'reflector' and add pacman hooks

These should hopefully be available on GitHub or GitLab

#### Automatically recognize USB devices in Thunar (XFCE Only?)  

Install these packages for XFCE  
`thunar-volman`  
`gvfs`  

#### Audio setup

Try installing `pulseaudio` before doing anything else

### Network Management  

There are several network manager applications available to manage network connections. During the initial Arch installation you set up and enabled `netctl`. While `netctl` is a nice network manager, it uses a CLI and it's just simpler tweaking network connection settings via GUI (imho). I tried WICD but don't like it. Instead, use Gnome Network Manager.  

#### Install `networkmanager`, `network-manager-applet`, `xfce4-notifyd`  

`# pacman -S networkmanager network-manager-applet xfce4-notifyd`  

#### Disable netctl  

`# systemctl stop netctl-auto@wlp3s0.service`  
`# systemctl disable netctl-auto@wlp3s0.service`  

#### Enable NetworkManager  

`# systemctl enable NetworkManager.service`  
`# systemctl start NetworkManager.service`  

To switch back to netctl, simply execute the enable / disable commands above again and swap out `netctl-auto@wlp3s0.service` with `NetworkManager.service`  

---

## General Linux Commands {#generallinuxcommands}

Kill process
`$ pkill foobar`

Change owner (to allow permission to write files)
`# chown -R bgdawes:users /storage`

Decrypt PDF File with qpdf
`$ qpdf --decrypt inputpdffilename.pdf outputpdffilename.pdf`

Kill an application and then run it again the background
Use pkill to kill the process by name. You don't need to use sudo, sudo would kill ALL instances of picom running. pkill along will only kill the process that is being run by the current user.
`$ pkill picom`

Use -9 if you need some extra muscle and the program is really stuck.
`$ pkill -9 picom`

In Unix, a background process executes independently of the shell, leaving the terminal free for other work. To run a process in the background, include an & (an ampersand) at the end of the command you use to run the job. 
`$ picom &`

Video editing - use ffmpeg to strip out audio tracks: remove a specific audio stream / track

`$ ffmpeg -i input -map 0 -map -0:a:2 -c copy output`

`map 0` selects all streams from the input.
`map -0:a:2` then deselects audio stream 3. The stream index starts counting from 0, so audio stream 10 would be `0:a:9`.

Remove specific audio streams / tracks
Keep everything except audio streams #4 (at offset 3) and #7 (at offset 6):

`$ ffmpeg -i input -map 0 -map -0:a:3 -map -0:a:6 -c copy output`

---

## Git[^6] {#git}

### Initial Setup

Add user name and email to `~/.gitconfig`  
`$ git config --global user.name bgdawes`  
`$ git config --global user.email bart.g.dawes@gmail.com`  
add footnotes for arch wiki references  

### Create local repo

`cd` to the project directory `$ cd dotfiles`  
Create local git repo in that directory  
`$ git init`  

### Add folders and files to staging  

`$ git add *`

### Commit files added to staging[^7]  

`$ git commit -m "repo created"`  

### Upload repo to GitHub[^8]  

Create repo on GitHub, copy URL  
`$ git remote add origin https://github.com/new-repo-url`  
Verify URL (optional)  
`$ git remote -v`  
Push the changes in your local repository to GitHub
`$ git push origin master`  

Dont get confused by 'origin' - when Personal Access Tokens were rolled out, I tried to add a token in the terminal with this command:

`$ git remote set-url origin https://bgdawes:[don't actually paste your personal access token here you dum-dum]@github.com/bgdawes/dotfiles.git`

I got an error - but then I ran `$ git remote -v` and noticed that I needed to replace 'origin' with 'github-dotfiles'. At some point I must have changed this.

### Add files to repo and upload to GitHub  

Copy file to project folder  
Add file to staging `$ git add *`  
Commit file added to staging `$ git commit -m "added file foo"`  
Upload repo changes to GitHub `$ git push origin master`  

### Edit repo files  

Edit files in project folder
Add changes to staging `$ git add *`  
Commit edits in staging `$ git commit -m "edited/updated foo"`  
Upload repo changes to GitHub `$ git push origin master`  

### Working with branches  

I was messing around on github and accidently added a 'yaml' file to my repo. I didn't want to do this and deleted this on github. Then I went back and made changes on my local machine, added them to stage, committed them, and then tried to push them back to github. I couldn't because I had to merge the branches. This is what I did to fix it:  

`$ git log --oneline --decorate --graph --all`

```bash
* abf6e59 (HEAD -> master) updated linux notes
* 477ef66 updated linux notes
| * 00d364d (origin/master) Delete _config.yml
| * c8d93ab Set theme jekyll-theme-time-machine
| * 2ab835a Set theme jekyll-theme-cayman
|/  
* 11f56af updated linux notes
* 76b1f87 updated linux notes
* af09232 updated linux notes
* 842aad0 updated linux notes
* db9ac65 updated linux notes
* 6921927 added linux notes
* 0ba02b6 repo created
```

`$ git pull origin master`  
`$ git log --oneline --decorate --graph --all`  

```bash
*   2115836 (HEAD -> master) Merge branch 'master' of https://github.com/bgdawes/dotfiles
|\  
| * 00d364d (origin/master) Delete _config.yml
| * c8d93ab Set theme jekyll-theme-time-machine
| * 2ab835a Set theme jekyll-theme-cayman
* | abf6e59 updated linux notes
* | 477ef66 updated linux notes
|/  
* 11f56af updated linux notes
* 76b1f87 updated linux notes
* af09232 updated linux notes
* 842aad0 updated linux notes
* db9ac65 updated linux notes
* 6921927 added linux notes
* 0ba02b6 repo created
```

`$ git push origin master`
`$ git log --oneline --decorate --graph --all`

```bash
*   2115836 (HEAD -> master, origin/master) Merge branch 'master' of https://github.com/bgdawes/dotfiles
|\  
| * 00d364d Delete _config.yml
| * c8d93ab Set theme jekyll-theme-time-machine
| * 2ab835a Set theme jekyll-theme-cayman
* | abf6e59 updated linux notes
* | 477ef66 updated linux notes
|/  
* 11f56af updated linux notes
* 76b1f87 updated linux notes
* af09232 updated linux notes
* 842aad0 updated linux notes
* db9ac65 updated linux notes
* 6921927 added linux notes
* 0ba02b6 repo created
```

### Gist (pastebin alternative)

Gist is a really great way to paste stuff (like system journals) to github directly from the command line. This was a huge help when I messed up synergy and my system hung on boot / wouldn't even start. You have to first install the `gist` package and then set it up on github, the process was really easy - you do it through the command line and it gives you some token to enter on github. Then you can save boot journals to gist for debugging in case you mess up your system like I did with synergy.

`$ journalctl - b | gist -p`

---

## aurutils {#aurutils}

aurutils is the AUR helper to use. As expected, I made stupid mistakes setting this up. I eventually got things working by doing this:

### Install aurutils and create repository

#### Install aurutils from the AUR

Just read the wiki and make the package you idiot
Install `devtools` and `vifm`

#### Create the file /etc/pacman.d/aurpkgs

Create the file
`# touch /etc/pacman.d/aurpkgs`
Write the file

```#
# /etc/pacman.d/aurpkgs
#
# See the pacman.conf(5) manpage for option and repository directives

# # GENERAL OPTIONS
#
[options]
CacheDir = /var/cache/pacman/pkg
CacheDir = /var/cache/pacman/aurpkgs
CleanMethod = KeepCurrent

[aurpkgs]
SigLevel = Optional TrustAll
Server = file:///var/cache/pacman/aurpkgs
```

#### Update /etc/pacman.conf

Add this line to the bottom of the file
`Include = /etc/pacman.d/aurpkgs`

#### Create the repository root and database

`$ sudo install -d /var/cache/pacman/aurpkgs -o $USER`
`$ repo-add /var/cache/pacman/aurpkgs/aurpkgs.db.tar`

#### Synchronize pacman

`# pacman -Syu`

### Install AUR package

#### Build foo and its dependencies in an nspawn container

`$ aursync -c foo`
TIP: to quit vifm, type `:q`

#### Synchronize pacman with AUR package

`# pacman -Syu`

#### Install package

`# pacman -S foo`

### Update AUR packages

`$ aursync -u`

### Removing AUR packages

#### First, uninstall the package

`# pacman -Rsn foo`
Confirm the package is no longer installed
`# pacman -Sl aurpkgs`

#### Once the package is no longer installed, remove the package from the repository

`$ repo-remove /var/cache/pacman/aurpkgs/aurpkgs.db.tar foo`
Refresh package databases
`# pacman -Syu`
AUR package removed!

### Migrate existing AUR packages

Find the package tar.xz file
`~/builds/aurutils/aurutils-1.5.3-5-any.pkg.tar.xz`
Add the package file to the AUR local repository
`$ repo-add /var/cache/pacman/aurpkgs/aurpkgs.db.tar ~/builds/aurutils/aurutils-1.5.3-5-any.pkg.tar.xz`

### Query explicitly installed AUR packages

`# pacman -Sl aurpkgs`

### Reinstall aurutils

Every once in awhile, aurutils won't update itself. I asked about this in the arch forums and was told to just manually install the current version using `aur-fetch` and `aur-build`. I do this by following the steps below:

Change the directory to the folder where the aurutils AUR package will be saved:

`$ cd pkgbuilds`

Use `aur-fetch` to download `aurutils` from the AUR

`$ aur fetch aurutils`

Change the directory to the folder where the PKGBUILD file is located:

`$ cd /home/bgdawes/pkgbuilds/aurutils`

Use `aur-build` to build the package

`$ aur build aurutils`

None of this may be needed:

https://archlinux.org/news/switch-to-the-base-devel-meta-package-requires-manual-intervention/

https://forum.endeavouros.com/t/aur-update-failure-cannot-find-the-debugedit-binary/53062/13

---

## pandoc {#pandoc}  

Convert markdown file to a latex formatted PDF  
`$ pandoc *filepath*/linux_notes.md --pdf-engine=xelatex -o *filepath*/linux_notes.pdf`  

---

## vpn {#vpn}  

### Connect to Windscribe VPN

Check public IP address (google 'what is my ip')

Start windscribe service
`# systemctl start windscribe`

Login to windscribe
`$ windscribe login`

Turn firewall off. I used to turn the firewall on but it screws with the connection to much.
`$ windscribe firewall off`

Edit file: `/var/run/NetworkManager/resolv.conf` and change the address after nameserver to 1.1.1.1

```
# Generated by NetworkManager
search lan
nameserver 1.1.1.1
```

Start systemd-resolved.service
`# systemctl start systemd-resolved.service`

Check to confirm you can still connect to the innernette

Connect to windscribe
`$ windscribe connect`

Check public IP address (google 'what is my ip')
Did your public IP address change? If yes, yay, don loyd.

Check your account status to view your monthly limit
`$ windscribe account`

Don't forget to logout
`$ windscribe logout`

#### Don Lloyd with bittorrent using Windscribe VPN[^9]

>We give users as much as we possibly can to secure their internet connection. When connected to the VPN in the desktop app, all your traffic is encrypted and your ISP is only seeing a garbled mess being transmitted to and from Windscribe. That's it, unless they have cracked the highest level of encryption somehow, they won't know what you are doing. Along with that there is also the Always-On Firewall feature which essentially forces you to use the VPN or else you won't have internet. All traffic has to go through the VPN tunnel in that case.
>
>Combining the two, your connection is as secure and anonymous as it can be. Using these two features should prevent your ISP from ever knowing about any torrent traffic.
>
>The correct steps to take are as follows:
>
>1. Enable the Always-On Firewall by going to Preferences > Connection and choosing Always On for the Firewall Mode. Press OK to save the changes. On Linux, the command to do this is windscribe firewall on
>2. Connect to a VPN location, wait until you see the CONNECTED status in the app and only THEN open your torrent client. Don't open it until the VPN is connected as that can put you at risk of leaking your IP.
>3. Add your torrent file to the download list and download the file.
>4. Once downloaded, remove the torrent from the torrent client (right-click torrent > Delete/Remove) so that you are no longer acting as an upload node for that particular file. (If you want to keep uploading over the VPN, skip steps 4, 5 and 6)
>5. Finally, completely shut down the torrent client, usually by going to File > Exit or something similar to that. You don't want it running to reduce the risk of any torrent traffic leaking through your own IP.
>6. Once all that is complete, you can disconnect from the Windscribe VPN and disable the Always On Firewall in the Preferences again. On Linux, run the command windscribe firewall auto to return it to automatic mode.
>
>This is as bulletproof as it gets. If the steps are followed correctly, at no point is the torrent traffic ever exposed to your ISP since the Firewall only lets all the traffic go to Windscribe VPN server.

---

## Rsync & SSH {#rsyncssh} 

I have no idea how I set up the SSH connection unfortunately.

To pull a file from Giant to Symphonic from Symphonic's terminal
`$ rsync -P bgdawes@giant:/home/bgdawes/Documents/test.txt /home/bgdawes/Documents/temp`

To pull a folder from Giant to Symphonic from Symphonic's terminal
`$ rsync -P -r bgdawes@giant:/home/bgdawes/Documents/foldername /home/bgdawes/Documents/temp`

---

## Synergy {#synergy} 

Synergy is a great program that allows a single keyboard and mouse that can be used across multiple computers on the same network. I had a hard time setting it up though. There are several things working against it - it's paid for software so the linux version is outdated (but still in the official repos as of 03-21-2024) so I'm running synergy 1.11.1-1 on my kde-arch linux laptop as a client, synergy 1.11.1-1 on my main arch box as the server, and synergy 3.0.79 RC3 [windows version - Synergy 3 RC3] as another client. Don't remove this package if it's ever removed from the official repos.

I didn't document anything when I first set up Synergy and that was dumb. When I installed Plasma 6 on my KDE laptop, synergy no longer worked. Then when I tried to fix it, I broke the connection to my windows laptop. I tried to start from scratch by removing synergy from my main arch box and then the system hung on boot and wouldn't even start. I had to hit ctl+alt+F2, then I was able reinstall synergy and it worked.

The reason it hung on boot is that I had synergy autostarting using lightdm. When lightdm was initializing, there was a command at the end that was trying to start an application that no longer existed. Lightdm has depreciated autostarting applications so this wasn't a good way to do it anyway. Then I tried finding out how synergy was autostarting on my kde laptop. I found this by running the command `grep -rl 'synergyc symphonic' /` on every folder in `/` individually. I finally got lucky with `grep -rl 'synergyc symphonic' /usr`. Windows starts synergy by default with the synergy 3 release so no research was needed.

Once I had everything figured out, I stopped synergy from autostarting on my KDE laptop and my main arch box. Then I uninstalled synergy on all three systems. I followed the steps below to get everything working again. Note: as of 03/25/2024, the arch wiki for synergy is pretty helpful - it redirects now to 'input leap' though which is a fork of the original free version of synergy and it looks like work has stopped on input leap.

### Set up hosts on each computer

Update the hosts file on each computer to allow them to talk with each other. Host file locations and configuration listed by computer below. Once host files are configured on each computer, `ping` each computer you have in the host files (i.e. ping giant from symphonic, ping symphonic from giant, etc.). Hit ctrl+c to stop pinging on the command line. I have static IP's assigned for all three computers and set them up that way. I then experimented and attached an ethernet cable from symphonic to giant. I get a noticeably better performance having the ethernet IP in the hosts files for giant and symphonic. I looked up the ethernet IP by running `ip addr` the entry starting with 'e' lists the ethernet ip and the entry starting with 'w' lists the wifi ip.

symphonic `/etc/hosts`
```#
# /etc/hosts: static lookup table for host names
#

#<ip-address>	<hostname.domain.org>	<hostname>
127.0.0.1	localhost.localdomain	localhost
::1		localhost.localdomain	localhost
10.20.0.76 	giant.localdomain 	giant
192.168.86.38	US-PC2JY6YZ.localdomain	US-PC2JY6YZ
192.168.86.248	US-5CG828379W.localdomain	US-5CG828379W
104.25.93.117   retrowith.in
51.15.174.218   irc.retrowith.in

# End of file
```

giant `/etc/hosts`
```#
# /etc/hosts: static lookup table for host names
#

#<ip-address>	<hostname.domain.org>	<hostname>
127.0.0.1	localhost.localdomain	localhost
::1		localhost.localdomain	localhost
10.20.0.75 symphonic.localdomain symphonic

# End of file
```


work laptop `C:\WINDOWS\system32\drivers\etc\hosts`

```# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost

192.168.86.36	symphonic
```

### Configure Server

Server configuration file on github repo.

Set up synergy to run as a service with systemd.

The version of synergy available in the official repo installs with a systemd service. Synergy can run automatically at boot with this systemd service. Run this server as a user by following the steps below:

`$ systemctl --user enable synergys.service`
`$ systemctl --user start synergys.service`

### Configure Client (giant)

The new version of plasma uses wayland by default. Wayland doesn't support synergy. The computers connected but the mouse wouldn't display and the keyboard wouldn't work. I updated `sddm` settings through the GUI to autostart a bgdawes session and also switched the wayland default back to x11.

I wanted `synergyc` to autostart as a systemd service instead of being started by `sddm`. I followed the arch wiki exactly and created a service for `synergyc`:

`/home/bgdawes/.config/systemd/user/synergyc.service`
```[Unit]
Description=Synergy Client Daemon
After=network.target

[Service]
ExecStart=/usr/bin/synergyc --no-daemon symphonic
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```
Then I ran the following commands:
`# systemctl daemon-reload`
`$ systemctl --user start synergyc.service`
`$ systemctl --user enable synergyc.service`

Everything worked great until I rebooted giant. Synergy didn't work but `$ ps aux | grep synergyc` listed that `synergyc` was up and running under user `bgdawes`.

I messed around with trying to autostart synergyc using plasma tools but gave up and switched back to starting `synergyc` under root through `sddm`.

`/usr/share/sddm/scripts/Xsetup`
```
#!/bin/sh
# Xsetup - run as root before the login dialog appears

synergyc symphonic
```

### Configure Client (work laptop)

I originally installed synergy 1 but it got laggy / buggy, then I installed Synergy 3 (Synergy 3 RC3) and everything works well (knock on wood). I spent hours trying to add `symphonic` as a computer to get this to work but the connection would always fail. Finally I clicked (or slid the switch) on 'manual config'. That brought up a menu where I could add the host name and wifi ip of `symphonic`. After that, everything works perfectly.

## Stow {#stow}

Move new stow file to dotfiles folder
`# mv /etc/synergy.conf /home/bgdawes/dotfiles/etc/`

Change directory to new stow file
`$ cd dotfiles`

Create symlink to where the new stow file should go. Note: you may need to run this as sudo if the target location is owned by root.
`# stow -t /etc/ etc`

I'm still not quite sure how stow works but I've got it to work the way I want it to work. In the example above I had to use the -t command to get the symlink established. I think this might be because the file I wanted to stow is in /etc/? Regardless, next time you want to stow something, hopefully this will help.

Reference that helped me to understand stow a little better: https://gist.github.com/andreibosco/cb8506780d0942a712fc

## RetroArch {#retroarch}

RetroArch is awesome but it's tricky to configure and I've been having so much fun with it that I want to document how I've set this up (from what I can remember).

Install `retroarch`, `retroarch-assets-xmb`, `retroarch-assets-ozone`, and `gamemode`.

Run `retroarch` and change the user interface to 'ozone'. Navigate to Settings > User Interface > Menu (all the way at the bottom of the menu). Restart.

In the GUI, 'enter' cycles forward through the menus and 'backspace' cycles back.

Enable 'Game Mode'. Navigate to Settings > Latency > Game Mode (all the way at the bottom of the menu.) Switch it to on. Restart

Download cores, assets, controller profiles, cheats, databases, overlays, and shaders with the 'online updater'. If you don't see this in the main menu then update the `~/.config/retroarch/retroarch.cfg` file and update this line to be `menu_show_core_updater = "true"`.

Import games by selecting import content on the main menu and update thumbnails available under the online updater.

### Delete Playlists

I fucked around and messed up some shit with the NES emulator and had to delete all things NES related in this folder: ~/.config/retroarch/playlists. Later I figured out that I can just delete playlists directly in retroarch under 'manage playlists'. Also, my rom set for NES messed up and wouldn't download thumbnails so I downloaded a new rom set from RW and it worked (I think because the file names of the roms follow the 'no-intro' naming convention).

### Configure Cores

After loading a game, hit F1 (I kinda can't believe this works because I have sxhkd assigned to F1 for bspwm) and it'll bring up the 'quick menu'.

Add shaders: I've only been playing cores 16-bit and below so the shader `/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp` works great for all of them except for N64

Add overlays: overlays are fun. yay. the only overlays availavble via retroarch online updater are for the NES / SNES.

Save Core configuration: on 'quick menu' navigate to 'Overrides' then select 'Save Core Overrides'. This will save your shaders, overlays, and controls.

IMPORTANT NOTE FOR SEGA MASTER SYSTEM / GENESIS OVERRIDES: Both SMS and Genesis use the same core so you need to save everything using content directory overrides.

Also, set a default core for each playlist.

### Configure joysticks
I way over-complicated controller setup. I took inspiration from this reddit post (https://www.reddit.com/r/RetroArch/comments/vq8wyw/guide_how_to_assign_multiple_different/). I literally just plugged in each controller and saved each controller using it's default profile. Then I configured buttons by core (example: 8bitdo_NES_remap.rmp). 

8bitdo controller setup notes - I swaped buttons II and IV for the turbo-grafix 16, I also had to map button A to C and X to B for the sega master system and lastly I swapped buttons X and B on the NES core.

I watched a youtube video to set up the N64 pad - the trick here was that the yellow buttons are considered the 'right joystick'.

#### Genesis USB controller setup

This one took me awhile so I wanted to document.

Use default controller setup. IMPORTANT NOTE FOR SEGA MASTER SYSTEM / GENESIS OVERRIDES: Both SMS and Genesis use the same core so you need to save everything using content directory overrides. Change controls to:

B button should be assigned to A

C button should be assigned to B

Z button should be assigned to C

### Cheats

https://www.makeuseof.com/how-to-use-retroarch-cheat-retro-games/

---

[^1]:If not hard-wired; jot down device that starts with 'w'; wireless devices will usually follow a naming convention of 'wlp#s0'  

[^2]:NOOB MISTAKE - arrow down to select free space before creating  another partition, otherwise you won't be able to use the rest of the  disk space  

[^3]:<https://www.howtogeek.com/196238/how-big-should-your-page-file-or-swap-partition-be/>  

[^4]:<https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Installation_Guide/s2-diskpartrecommend-ppc.html#id4394007>  

[^5]:<https://bbs.archlinux.org/viewtopic.php?id=23793>  

[^6]:<https://www.reddit.com/r/learnprogramming/comments/al0ebi/anyone_got_an_eli5_version_for_basic_git/>  

[^7]:<https://stackoverflow.com/questions/2419249/how-can-i-stage-and-commit-all-files-including-newly-added-files-using-a-singl>  

[^8]:<https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/> 

[^9]:<https://windscribe.com/support/article/21/using-windscribe-with-torrent-clients>