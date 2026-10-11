# Solfège 1 - version française, built from the three-language source in solfege1.py.
from solfege1 import SOURCE
from solfege_common import build

globals().update(build(*SOURCE, 'fr'))
