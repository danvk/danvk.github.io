import struct

class Square(object):
  def __init__(self, char):
    self.char = char
    self.down = None
    self.across = None

  def __repr__(self):
    return self.char
  
  def number(self):
    return self.down or self.across


class Crossword(object):
  def __init__(self):
    self.width = 0
    self.height = 0

  @staticmethod
  def FromString(puz):
    return Convert(puz)


def Convert(puz):
  """Returns a Crossword from a puz string"""
  if puz[2:14] != 'ACROSS&DOWN\0':
    print "Failure! No ACROSS&DOWN"
    return None

  c = Crossword()
  c.checksum = puz[0:2]

  WIDTHOFFSET = 0x2c   # :nodoc:
  HEADERLENGTH = 0x34  # :nodoc:

  c.width, c.height, c.cluecount = struct.unpack('3B', puz[WIDTHOFFSET:
                                                       WIDTHOFFSET+3])

  ofs = HEADERLENGTH
  key = puz[ofs:ofs+c.width*c.height]
  ofs += len(key)
  dashes = puz[ofs:ofs+c.width*c.height]  # unused...?
  ofs += len(dashes)

  # sometimes the comment contains nuls.
  # so we limit the split to clues + 3 headers + optional comment.
  strings = puz[ofs:].split("\0", c.cluecount + 3 + 1)

  # TODO(checksum)

  # XXX right here we should convert the strings to UTF-8.

  clueoffset = ofs
  c.title = strings[0]
  clueoffset += len(c.title) + 1
  c.author = strings[1]
  clueoffset += len(c.author) + 1
  c.copyright = strings[2]
  clueoffset += len(c.copyright) + 1
  strings = strings[3:]

  # TODO(danvk): something wonky here
  c.comment = ""
  if len(strings) > c.cluecount:
    c.comment = strings.pop()
    # TODO: @comment.gsub!(/\0$/, '') # the last has a trailing nul, too


  c.squares = [ [None for y in range(0,c.height)]
                 for x in range(0,c.width)]
  for y in range(0, c.height):
    for x in range(0, c.width):
      char = key[y * c.width + x]
      if char != '.':
        c.squares[x][y] = Square(char)

  # Assign numbers to each square
  num = 1
  for y in range(0, c.height):
    for x in range(0, c.width):
      square = c.squares[x][y]
      if not square: continue
      # we're a numbered square if we're on an min extreme
      # and we have at least one square following...
      down, across = False, False
      if ((x == 0 or not c.squares[x-1][y]) and
          (x+1 < c.width and c.squares[x+1][y])):
        across = True

      if ((y == 0 or not c.squares[x][y-1]) and
          (y+1 < c.height and c.squares[x][y+1])):
        down = True

      if down or across:
        if down:   square.down = num
        if across: square.across = num
        num += 1

  # Parse out the down/across clues
  c.down = {}
  c.across = {}
  n = 0
  for y in range(0, c.height):
    for x in range(0, c.width):
      square = c.squares[x][y]
      if not square: continue

      if square.across:
        c.across[square.across] = strings[n]
        n += 1
      if square.down:
        c.down[square.down] = strings[n]
        n += 1

  # Parse out the down/across answers
  c.answers_across = {}
  c.answers_down = {}
  for y in range(0, c.height):
    for x in range(0, c.width):
      square = c.squares[x][y]
      if not square: continue

      if square.across:
        answer = ''
        for nx in range(x, c.width):
          if not c.squares[nx][y]: break
          answer += str(c.squares[nx][y])
        c.answers_across[square.across] = answer

      if square.down:
        answer = ''
        for ny in range(y, c.height):
          if not c.squares[x][ny]: break
          answer += str(c.squares[x][ny])
        c.answers_down[square.down] = answer

  return c
