#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='[\u@\h \W]\$ '

PATH=$PATH:~/bin:~/.scripts
alias storageripmoofie='dvdbackup -i /dev/sr0 -o /home/bgdawes/storage/dvdworkspace/dvd-copiez -M'
alias storage2ripmoofie='dvdbackup -i /dev/sr0 -o /home/bgdawes/storage2/dvdworkspace/dvd-copiez -M'
alias mainripmoofie='dvdbackup -i /dev/sr0 -o /home/bgdawes/Videos/dvd-copiez -M'
alias shutdown='shutdown -h now'
alias playdvd='mplayer dvdnav:// -mouse-movements -dvd-device'
alias usbeject='umount /dev/sdc1 && sudo eject /dev/sdc'

export EDITOR='nano'
export VISUAL='nano'
export PAGER='most'

complete -cf sudo man

powerline-daemon -q
POWERLINE_BASH_CONTINUATION=1
POWERLINE_BASH_SELECT=1
. /usr/share/powerline/bindings/bash/powerline.sh
