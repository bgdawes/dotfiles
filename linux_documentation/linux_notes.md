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

Appendix

## Arch Linux Install - PC Build {#archlinuxinstallpcbuild}

### Boot archiso from USB

Two different options were available with this release. Selected the option that specifies 'Partition 1 UEFI'.

### Verify boot mode

- Verify UEFI boot mode  
    `# ls /sys/firmware/efi/efivars`  

- The directory should exist and return a bunch of files  

### Connect to the Innernette  

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
`pkill foobar`

Change owner (to allow permission to write files)
`chown fartdawes foobar`

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
`git remote add origin https://github.com/new-repo-url`  
Verify URL (optional)  
`$ git remote -v`  
Push the changes in your local repository to GitHub
`git push origin master`  

Dont get confused by 'origin' - when Personal Access Tokens were rolled out, I tried to add a token in the terminal with this command:

`git remote set-url origin https://bgdawes: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@github.com/bgdawes/dotfiles.git`

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

---

## aurutils {#aurutils}

aurutils is the AUR helper to use. As expected, I made stupid mistakes setting this up. I eventually got things working by doing this:

### Install aurutils and create repository

#### Install aurutils from the AUR

Just read the wiki and make the package you idiot
Install `devtools` and `vifm`

#### Create the file /etc/pacman.d/aurpkgs

Create the file
`sudo touch /etc/pacman.d/aurpkgs`
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

`sudo pacman -Syu`

### Install AUR package

#### Build foo and its dependencies in an nspawn container

`aursync -c foo`
TIP: to quit vifm, type `:q`

#### Synchronize pacman with AUR package

`sudo pacman -Syu`

#### Install package

`sudo pacman -S foo`

### Update AUR packages

`aursync -u`

### Removing AUR packages

#### First, uninstall the package

`# pacman -Rsn foo`
Confirm the package is no longer installed
`# pacman -Sl aurpkgs`

#### Once the package is no longer installed, remove the package from the repository

`repo-remove /var/cache/pacman/aurpkgs/aurpkgs.db.tar foo`
Refresh package databases
`sudo pacman -Syu`
AUR package removed!

### Migrate existing AUR packages

Find the package tar.xz file
`~/builds/aurutils/aurutils-1.5.3-5-any.pkg.tar.xz`
Add the package file to the AUR local repository
`repo-add /var/cache/pacman/aurpkgs/aurpkgs.db.tar ~/builds/aurutils/aurutils-1.5.3-5-any.pkg.tar.xz`

### Query explicitly installed AUR packages

`# pacman -Sl aurpkgs`

---

## pandoc {#pandoc}  

Convert markdown file to a latex formatted PDF  
`pandoc *filepath*/linux_notes.md --pdf-engine=xelatex -o *filepath*/linux_notes.pdf`  

---

## vpn {#vpn}  

### Connect to Windscribe VPN

Check public IP address (google 'what is my ip')

Edit file: /var/run/NetworkManager/resolv.conf and change the address after nameserver to 1.1.1.1

```
# Generated by NetworkManager
search lan
nameserver 1.1.1.1
```

Start systemd-resolved.service
`# sudo systemctl start systemd-resolved.service`

Check to confirm you can still connect to the innernette

Start windscribe service
`# systemctl start windscribe`

Login to windscribe
`$ windscribe login`

Turn on firewall
`$ windscribe firewall on`

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
`rsync -P bgdawes@giant:/home/bgdawes/Documents/test.txt /home/bgdawes/Documents/temp`

To pull a folder from Giant to Symphonic from Symphonic's terminal
`rsync -P -r bgdawes@giant:/home/bgdawes/Documents/foldername /home/bgdawes/Documents/temp`

---

### Decrypt PDF File with qpdf

`qpdf --decrypt inputpdffilename.pdf outputpdffilename.pdf`

---

### Kill an application and then run it again the background

Use pkill to kill the process by name. You don't need to use sudo, sudo would kill ALL instances of picom running. pkill along will only kill the process that is being run by the current user.

`pkill picom`

Use -9 if you need some extra muscle and the program is really stuck.

`pkill -9 picom`

In Unix, a background process executes independently of the shell, leaving the terminal free for other work. To run a process in the background, include an & (an ampersand) at the end of the command you use to run the job. 

`picom &`

---

### Video editing - use ffmpeg to strip out audio tracks

Remove a specific audio stream / track

`ffmpeg -i input -map 0 -map -0:a:2 -c copy output`

`map 0` selects all streams from the input.
`map -0:a:2` then deselects audio stream 3. The stream index starts counting from 0, so audio stream 10 would be `0:a:9`.

Remove specific audio streams / tracks
Keep everything except audio streams #4 (at offset 3) and #7 (at offset 6):

`ffmpeg -i input -map 0 -map -0:a:3 -map -0:a:6 -c copy output`


[^1]:If not hard-wired; jot down device that starts with 'w'; wireless devices will usually follow a naming convention of 'wlp#s0'  

[^2]:NOOB MISTAKE - arrow down to select free space before creating  another partition, otherwise you won't be able to use the rest of the  disk space  

[^3]:<https://www.howtogeek.com/196238/how-big-should-your-page-file-or-swap-partition-be/>  

[^4]:<https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Installation_Guide/s2-diskpartrecommend-ppc.html#id4394007>  

[^5]:<https://bbs.archlinux.org/viewtopic.php?id=23793>  

[^6]:<https://www.reddit.com/r/learnprogramming/comments/al0ebi/anyone_got_an_eli5_version_for_basic_git/>  

[^7]:<https://stackoverflow.com/questions/2419249/how-can-i-stage-and-commit-all-files-including-newly-added-files-using-a-singl>  

[^8]:<https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/> 

[^9]:<https://windscribe.com/support/article/21/using-windscribe-with-torrent-clients>