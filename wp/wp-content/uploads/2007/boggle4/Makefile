CC = g++
CPPFLAGS = -g -Wall -O3 -march=i686

all: test perf scorer

test: test.o boggler.o
perf: perf.o boggler.o
scorer: scorer.o boggler.o

clean:
	rm *.o test perf scorer
