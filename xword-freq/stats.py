#!/usr/bin/python
import crossword
import glob
import sys

if len(sys.argv) > 1:
  pat = sys.argv[1]
else:
  pat = "/Users/danvk/Documents/times/puzzles/????-??-??.puz"

puzzles = glob.glob(pat)
num_puzzles = len(puzzles)
answers = {}
for f in puzzles:
  c = crossword.Crossword.FromString(file(f).read())
  if not c:
    print "Couldn't read %s" % f
    continue

  for ans in c.answers_across.itervalues():
    if not ans in answers:
      answers[ans] = 1
    else:
      answers[ans] += 1

  for ans in c.answers_down.itervalues():
    if not ans in answers:
      answers[ans] = 1
    else:
      answers[ans] += 1

for (answer, count) in answers.iteritems():
  if count == 1: continue
  print "%5d %.3f%%: %s" % (count, 100.0 * count / num_puzzles, answer)
