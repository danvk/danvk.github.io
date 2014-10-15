CC = g++
CPPFLAGS = -g -Wall -O3 -march=i686
#CPPFLAGS = -g -Wall -pg -pedantic -pg
#LDFLAGS = -pg

all: test perf scorer

test: test.o trie.o boggler.o
perf: perf.o trie.o boggler.o
scorer: scorer.o boggler.o trie.o

clean:
	rm *.o test
