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

#### Install additional hard drives: partition drive, create file system, and mount on boot

Create a directory to mount the new drive:

`$ mkdir storage*`

Place additional hard drive in tower. Buy a quality SATA connecter and connect hard drive to motherboard. Connect hard drive to power supply. Run the following command to verify that the hard drive is recognized:

`$ lsblk`

Create partition for the new drive:

`# fdisk /dev/sd*`

Add a new partition by selection command 'n'. Select default partition type 'p'. Select default partition number '1'. Select default first sector '2048'. Select default last sector '1953525167'. Select 'w' to write partition to disk and exit. Run the following command to verify that the new hard drive device was recognized.

`$ lsblk`

Create a file system on the new hard drive.

`# mkfs.ext4 /dev/sd*1`

The output will give you the files system's UUID. You can also find this by the following command:

`# blkid`

Update the fstab file with the new UUID to mount the new drive on boot.

#### As needed, chown additional storage drive mount folders[^5]

`# chown -R bgdawes:users [storage drive mount folder directory]`

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

System install date
`$ head -n 1 /var/log/pacman.log`
`# tune2fs -l /dev/sda3 | grep created`

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

Audio editing - use ffmpeg to convert audio file format

`ffmpeg -i inputFile.ogg outputFile.mp3`

Compressing / zip multiple files individually in a directory. I had a bunch of files I wanted to compress individually and was able to do this using the following command in the terminal:

`find /home/bgdawes/games/neosd/neo_geo_zip_test -type f -execdir zip '{}.zip' '{}' \;`

List running systemd services:

`systemctl list-units --type=service --state=running`

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

##### Installing AUR packages with aurutils >= 20.5.2-1

When I tried to install a package from the AUR after updating to version 20.5.2-1, I received the following error:

    Error:
        aur-chroot could not find a pacman.conf(5) file for container usage. Before
        using aur-chroot, make sure this file is created and valid. See OPTIONS in
        aur-chroot(1) for configuration details.
    
        The following file paths were checked:
            '/etc/aurutils/pacman-x86_64.conf'
            '/usr/share/devtools/pacman.conf.d/aurutils-x86_64.conf'

To fix this, I created a pacman file specifically for aurutils `pacman-x86_64.conf`, saved it in the `/etc/aurutils/` folder, and posted the file on github. The next step is to remove `/var/lib/aurbuild/x86_64/root` and recreate it with `aur chroot --create` (as helpfully instructed on the Arch forums, link below)

https://bbs.archlinux.org/viewtopic.php?pid=2250579#p2250579

`# rm -r /var/lib/aurbuild/x86_64/root`

`$ aur chroot --create`

Fixed!

---

## pandoc {#pandoc}  

Convert markdown file to a latex formatted PDF  
`$ pandoc *filepath*/linux_notes.md --pdf-engine=xelatex -o *filepath*/linux_notes.pdf`  

---

## vpn {#vpn}  

### Connect to Windscribe VPN

Change protocol to UDP!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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

---

## YAC Reader {#yacreader}

To load PDF and CBR files to iPad to be viewed on YAC Reader, connect iPad to compruter, then copy PDF and / or CBR files to the iPad YAC folder. On the iPad, click the import button at the top and then click the File Sharing button. Click the import button. You should see the file transfer progress at the top right.

---

## Stow {#stow}

Make sure to check file permissions!

Move new stow file to dotfiles folder
`# mv /etc/synergy.conf /home/bgdawes/dotfiles/etc/`

Change directory to new stow file
`$ cd dotfiles`

Create symlink to where the new stow file should go. Note: you may need to run this as sudo if the target location is owned by root.
`# stow -t /etc/ etc`

I'm still not quite sure how stow works but I've got it to work the way I want it to work. In the example above I had to use the -t command to get the symlink established. I think this might be because the file I wanted to stow is in /etc/? Regardless, next time you want to stow something, hopefully this will help.

Reference that helped me to understand stow a little better: https://gist.github.com/andreibosco/cb8506780d0942a712fc

---

## RetroArch {#retroarch}

RetroArch is awesome but it's tricky to configure and I've been having so much fun with it that I want to document how I've set this up (from what I can remember).

Install `retroarch`, `retroarch-assets-xmb`, `retroarch-assets-ozone`, and `gamemode`.

Run `retroarch` and change the user interface to 'ozone'. Navigate to Settings > User Interface > Menu (all the way at the bottom of the menu). Restart.

In the GUI, 'enter' cycles forward through the menus and 'backspace' cycles back.

Enable 'Game Mode'. Navigate to Settings > Latency > Game Mode (all the way at the bottom of the menu.) Switch it to on. Restart

Download cores, assets, controller profiles, cheats, databases, overlays, and shaders with the 'online updater'. If you don't see this in the main menu then update the `~/.config/retroarch/retroarch.cfg` file and update this line to be `menu_show_core_updater = "true"`.

To zip multiple files into their own individual zip files use this command: `find /home/bgdawes/games/neo_geo_roms/NeoSD -type f -execdir zip '{}.zip' '{}' \;`

##### MAME Notes

MAME is a little tricky to set up. Finding the ROMS and figuring out which cores to use was complicated. The best ROMS I found were both on the internet archive. Each romset needs their own specific core listed below:

FinalBurn Neo romset: https://archive.org/details/cylums-final-burn-neo-rom-collection  
MAME 2000 romset: https://archive.org/details/MAME0.37b5_MAME2000_Reference_Set_Update_2_ROMs_Samples

To rotate the screen when the display is vertical, navigate to: Settings > Video > Output > Video Rotation. Select the option to display the screen correctly and then navigate to: Quick Menu > Overrides > Save Game Overrides. This will save the screen rotation for the particular game.

### Playlists

Create a playlist by importing games. Select import content on the main menu and update thumbnails available under the online updater. Set a default core for each playlist.

### Configure Cores

After loading a game, hit F1 (I kinda can't believe this works because I have sxhkd assigned to F1 for bspwm) and it'll bring up the 'quick menu'. Save Core configuration: on 'quick menu' navigate to 'Overrides' then select 'Save Core Overrides'. This will save your shaders, overlays, and controls.

Core list:

Arcade (FinalBurn Neo)  
Arcade (MAME 2000)  
Atari 2600 (Stella 2023)  
Atari Jaguar (Virtual Jaguar)  
Atari Lynx (Handy)  
ColecoVision (Gearcoleco)  
Commodore C64 (VICE x64sc, accurate)  
Turbo-Grafix 16 (Beetle PCE FAST)  
Nintendo DS (melonDS DS)  
Game Boy Advance (mGBA)  
Nintendo 64 (ParaLLEI N64)  
NES (Mesen)  
SNES (Snes9x)  
Sega Master System (SMS Plus GX)  
Sega Genesis (Genesis Plus GX)  
Sega 32X (PicoDrive)  
Neo Geo (Geolith)  

### ROM file locations

The list below contains the rom file locations for each core: 

Core list (original):

Arcade (FinalBurn Neo) - `/home/bgdawes/games/cylums-final-burn-neo-rom-collection/Cylum's FinalBurn Neo ROM Collection (02-18-21)/`  
Arcade (MAME 2000) - `/home/bgdawes/games/MAME0.37b5_MAME2000_Reference_Set_Update_2_ROMs_Samples/roms/`  
Atari 2600 (Stella 2023) - `/home/bgdawes/games/Atari - 2600/`  
Atari Jaguar (Virtual Jaguar) - `/home/bgdawes/games/Atari - Jaguar/`  
Atari Lynx (Handy) - `/home/bgdawes/games/no_intro_rom_sets/proper1g1r-collection/ROMs/Atari - Lynx (LYX)/`  
ColecoVision (Gearcoleco) - `/home/bgdawes/games/no_intro_rom_sets/proper1g1r-collection/ROMs/Coleco - ColecoVision/`  
Commodore C64 (VICE x64sc, accurate) - `/home/bgdawes/games/Commodore - Commodore 64 (PP)/`  
Turbo-Grafix 16 (Beetle PCE FAST) - `/home/bgdawes/games/retro-within/Complete NTSC-US TurboGrafx-16 Roms - Videos - Manuals Collection/NTSC-US TurboGrafx-16 Roms/`  
Nintendo DS (melonDS DS) - `/home/bgdawes/games/roms_nds/`  
Game Boy Advance (mGBA) - `/home/bgdawes/games/roms-bestset-nintendo-game-boy-advance/`  
Nintendo 64 (ParaLLEI N64) - `/home/bgdawes/games/retro-within/Complete NTSC-US Nintendo 64 Roms - Videos - Manuals Collection/NTSC-US Nintendo 64 Roms/`  
NES (Mesen) - `/home/bgdawes/games/retro-within/Nintendo Entertainment System/`  
SNES (Snes9x) - `/home/bgdawes/games/retro-within/Complete NTSC-US Super Nintendo Roms - Videos - Manuals Collection/NTSC-US Super Nintendo System Roms/`  
Sega Master System (SMS Plus GX) - `/home/bgdawes/games/Cylum's Sega Master System ROM Collection (02-16-2021)/`  
Sega Genesis (Genesis Plus GX) - `/home/bgdawes/games/no_intro_rom_sets/proper1g1r-collection/ROMs/Sega - Mega Drive - Genesis/`  
Sega 32X (PicoDrive) - `/home/bgdawes/games/no_intro_rom_sets/proper1g1r-collection/ROMs/Sega - 32X/`  
Neo Geo (Geolith) - `/home/bgdawes/games/neo_geo_roms/NeoSD/`  

Core list (updated for new drive migration):

Arcade (FinalBurn Neo) - `/home/bgdawes/storage2/video_games/video_game_files/arcade/fbneo/`  
Arcade (MAME 2000) - `/home/bgdawes/storage2/video_games/video_game_files/arcade/mame/`  
Atari 2600 (Stella 2023) - `/home/bgdawes/storage2/video_games/video_game_files/atari/2600/`  
Atari Jaguar (Virtual Jaguar) - `/home/bgdawes/storage2/video_games/video_game_files/atari/jaguar/`  
Atari Lynx (Handy) - `/home/bgdawes/storage2/video_games/video_game_files/atari/lynx/`  
ColecoVision (Gearcoleco) - `/home/bgdawes/storage2/video_games/video_game_files/colecovision/`  
Commodore C64 (VICE x64sc, accurate) - `/home/bgdawes/storage2/video_games/video_game_files/commodore64/`  
Turbo-Grafix 16 (Beetle PCE FAST) - `/home/bgdawes/storage2/video_games/video_game_files/turbografx16/`  
Nintendo DS (melonDS DS) - `/home/bgdawes/storage2/video_games/video_game_files/nintendo/nds/`  
Game Boy Advance (mGBA) - `/home/bgdawes/storage2/video_games/video_game_files/nintendo/gameboy_advance/`  
Nintendo 64 (ParaLLEI N64) - `/home/bgdawes/storage2/video_games/video_game_files/nintendo/n64/`  
NES (Mesen) - `/home/bgdawes/storage2/video_games/video_game_files/nintendo/nes/`  
SNES (Snes9x) - `/home/bgdawes/storage2/video_games/video_game_files/nintendo/snes/`  
Sega Master System (SMS Plus GX) - `/home/bgdawes/storage2/video_games/video_game_files/sega/master_system/`  
Sega Genesis (Genesis Plus GX) - `/home/bgdawes/storage2/video_games/video_game_files/sega/genesis/`  
Sega 32X (PicoDrive) - `/home/bgdawes/storage2/video_games/video_game_files/sega/32x/`  
Neo Geo (Geolith) - `/home/bgdawes/storage2/video_games/video_game_files/neo_geo/`  

#### Shaders

Add shaders: I've only been playing cores 16-bit and below so the shader `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp` works great for all of them except for N64

Update: `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp` shaders weren't showing up after I gutted retroarch so I changed Drivers under Settings to `gl` and that restored the shaders.

The best N64 shader I've found is `crt-aperture.glslp` `/shaders/shaders_glsl/crt/crt-aperture.glslp`

Shaders are saved by core here: /home/bgdawes/.config/retroarch/config/CORE_NAME/

Shader list:

Arcade (FinalBurn Neo) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-geom.glslp`  
Arcade (MAME 2000) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-geom.glslp`  
Atari 2600 (Stella 2023) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Atari Jaguar (Virtual Jaguar) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Atari Lynx (Handy) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/handheld/ags001.glslp`  
ColecoVision (Gearcoleco) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Commodore C64 (VICE x64sc, accurate) - `/home/bgdawes/.config/retroarch/config/VICE x64sc/VICE x64sc.glslp`
Turbo-Grafix 16 (Beetle PCE FAST) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Nintendo DS (melonDS DS) - `/home/bgdawes/.config/retroarch/config/melonDS DS/melonDS DS.glslp`  
Game Boy Advance (mGBA) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Nintendo 64 (ParaLLEI N64) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/shaders/crt-aperture.glsl`  
NES (Mesen) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
SNES (Snes9x) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Sega Master System (SMS Plus GX) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Sega Genesis (Genesis Plus GX) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
Sega 32X (PicoDrive) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/crt-royale-fake-bloom-intel.glslp`  
*Neo Geo (Geolith) - `/home/bgdawes/.config/retroarch/shaders/shaders_glsl/crt/shaders/crt-geom.glsl`  

*I customized the Neo Geo shader - updated lines below:

// Texture coordinates of the texel containing the active pixel.
	vec2 xy = (CURVATURE > 1.0) ? transform(TEX0.xy) : TEX0.xy;

#### Overlays

Add overlays: overlays are fun. yay. the only overlays availavble via retroarch online updater are for the NES, SNES, Genesis, and 32X.

https://forums.libretro.com/t/console-game-themed-bezels/10472

Overlay list:

Arcade (custom)  
Atari 2600 (custom)  
Atari Jaguar (custom)
Atari Lynx (custom)  
ColecoVision (custom)  
Commodore C64 (custom)  
Turbo-Grafix 16 (custom)  
Nintendo DS (custom)  
Game Boy Advance (custom)  
Nintendo 64 (custom)  
NES (built-in)  
SNES (built-in)  
Sega Master System (custom)  
Sega Genesis (built-in)  
Sega 32X (built-in)  
Neo Geo (custom)  

#### Controllers

I way over-complicated controller setup. I took inspiration from this reddit post (https://www.reddit.com/r/RetroArch/comments/vq8wyw/guide_how_to_assign_multiple_different/). I literally just plugged in each controller and saved each controller using it's default profile. Then I configured buttons by core (example: 8bitdo_NES_remap.rmp). 

8bitdo controller setup notes - I swaped buttons II and IV for the turbo-grafix 16, I also had to map button A to C and X to B for the sega master system and lastly I swapped buttons X and B on the NES core.

I watched a youtube video to set up the N64 pad - the trick here was that the yellow buttons are considered the 'right joystick'.

##### Genesis USB controller setup

This one took me awhile so I wanted to document.

 Use default controller setup. Change controls to:

B button should be assigned to A

C button should be assigned to B

Z button should be assigned to C

### RetroArch restore notes

I used to use a single core for both SMS and Genesis games. I wanted to use separate cores instead. For whatever reason, the genesis core wouldn't save overrides. I basically gutted as many config / history files that I could and removed all cores. I then downloaded all the cores I use again through the online updater. When I tried to reload the cores it failed so I found this https://www.reddit.com/r/RetroArch/comments/18p94gi/failed_to_install_every_core/ and updated these lines in `~/.config/retroarch/retroarch.cfg`:

FROM:

libretro_directory = "/usr/lib/libretro"
libretro_info_path = "/usr/share/libretro/info"

TO:

libretro_directory = "~/.config/retroarch/cores"
libretro_info_path = "~/.config/retroarch/cores/info"

This worked and I didn't have to reinstall the cores.

These are the cores I like for each system:

Atari: Stella
TG-16: Beetle PCE Fast
N64: ParaLLEI N64
NES: Mesen
SNES: Snes9x
SMS: SMS Plus GX
Genesis: 

Thumbnails: to update thumbnails go to Main Menu > Online Updater > Playlist Thumbnail Updater
This updated almost all SMS thumbnails

At the bottom of Main Menu > Online Updater update everything: 'Update Core Info Files' through 'Update GLSL Shaders'

Had a problem with shaders. Couldn't select the best shader `crt-royale-fake-bloom-intel.glslp`. Updated cfg file:

FROM:

video_shader_dir = "/usr/share/libretro/shaders"
video_shader_enable = "false"

TO:

video_shader_dir = "~/.config/retroarch/shaders"
video_shader_enable = "true"

video_shader_remember_last_dir = "true"

That fixed shader problems for all cores using this shader.

I lost my overlay for SNES; this is a non-issue. I just resaved it and it worked

For my genesis problems, I think it's the core: BlastEm. The shader wouldn't save to the core so I copied: `/home/bgdawes/.config/retroarch/config/SMS Plus GX/SMS Plus GX.glslp` to `/home/bgdawes/.config/retroarch/config/BlastEm/BlastEm.glslp`. That fixed the shader saving but I'm still gonna delete the core and try the Genesis Plus GX core.

https://www.reddit.com/r/RetroArch/comments/yddd4s/core_overrides_not_saving/
https://www.reddit.com/r/RetroArch/comments/7n94x3/how_do_i_delete_game_history_in_retroarch/
https://www.reddit.com/r/RetroArch/comments/yddd4s/core_overrides_not_saving/
https://forums.launchbox-app.com/topic/79126-retroarch-overrides-wont-let-me-save-configuration/
https://www.reddit.com/r/RetroArch/comments/1aorbbz/i_cant_save_overrides/
https://www.reddit.com/r/RetroArch/comments/1jv9irs/so_is_blastem_not_supposed_to_have_any_options_at/

### Cheats

https://www.makeuseof.com/how-to-use-retroarch-cheat-retro-games/

---

## Steam {#steam}

I really really really wanted to play Bionic Commando Rearmed on Steam, howerver, this took FOREVER for me to figure out how to get this game to play on Arch (time I really should have been spent on other things). That said, it was so damn satisfying when it finally fired up. Here's what I did:

Install steam

Install drivers
`sudo pacman -Syu vulkan-icd-loader lib32-vulkan-icd-loader vulkan-intel lib32-vulkan-intel`

Install the game or uninstall then reinstall the game. Then use protontricks to install the physx driver:

https://archive.org/details/phys-x-9.10.0513-system-software

Once I did all of this though, the game was laggy as hell and made the gameplay not fun. To fix this, simply adjust the resolution inside the game. Change the resolution settings from 1920x1080 to 1280x720. Then it works and it's so great that it was worth all the effort.

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