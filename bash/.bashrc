#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='[\u@\h \W]\$ '

PATH=$PATH:~/bin:~/.scripts
alias ripmoofie='dvdbackup -i /dev/sr0 -o /home/bgdawes/storage/dvdworkspace/dvd-copiez -M'
alias shutdown='shutdown -h now'
alias playdvd='mplayer dvdnav:// -mouse-movements -dvd-device'
alias usbeject='umount /dev/sdc1 && sudo eject /dev/sdc'

export EDITOR='nano'
export VISUAL='nano'

. /usr/lib/python3.7/site-packages/powerline/bindings/bash/powerline.sh
