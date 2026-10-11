# Solfège 2 - deutsche Fassung, built from the three-language source in solfege2.py.
from solfege2 import SOURCE
from solfege_common import build

globals().update(build(*SOURCE, 'de'))
