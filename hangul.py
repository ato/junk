# coding=utf8
#
# How I taught myself Hangul
#
import random

CS = u'ㄱ g, ㄴ n, ㄷ d, ㄹ l/r, ㅁ m, ㅂ b, ㅅ s, ㅇ ng, ㅈ j, ㅊ ch, ㅋ k, ㅌ t, ㅍ p, ㅎ h'
VS = u'ㅏ a, ㅓ eo, ㅗ o, ㅜ u, ㅡ eu, ㅣ i'

CONSONANTS = [x.split(' ') for x in CS.split(', ')]
VOWELS = [x.split(' ') for x in VS.split(', ')]

H2E = dict(CONSONANTS + VOWELS)
HC = [h for h,e in CONSONANTS]
HV = [h for h,e in VOWELS]


fails = ['Bad.', 'Wrong.', 'Lies...', 'Fail.', 'Loser.', '바보.', 'Try harder.',
         'Wipe out.']
wins = ['Win!', 'Woot!', 'Woohoo!', 'Yeah!', 'Correct!', 'Bingo!']

BLUE = '\033[94m'
RED = '\033[91m'
GREEN = '\033[92m'
WHITE = '\033[0m'

while True:
	h = random.choice(HC + HV)
	e = H2E[h]
	print WHITE + h + "?",
        g = raw_input(BLUE)
	if g == e:
		print GREEN + random.choice(wins)
	else:
		print RED + random.choice(fails), h, 'is', e

