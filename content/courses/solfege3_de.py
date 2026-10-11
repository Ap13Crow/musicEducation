# Solfège 3 - deutsche Fassung, built from the three-language source in solfege3.py.
from solfege3 import SOURCE
from solfege_common import build

globals().update(build(*SOURCE, 'de'))
