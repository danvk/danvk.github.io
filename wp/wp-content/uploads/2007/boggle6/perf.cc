#include "boggler.h"

#include <string>
#include <vector>
#include <iostream>
#include <fstream>
using namespace std;

void run_perf_test(Boggler* b, char* filename);
double secs();

int main(int argc, char** argv) {
	Boggler b;
	int size = b.LoadDictionary("words");
	cout << "Loaded " << size << " words." << endl;
	
	run_perf_test(&b, "test-boards");
}

void run_perf_test(Boggler* b, char* filename) {
	ifstream file(filename);
	if (!file) {
		fprintf(stderr, "couldn't open %s\n", filename);
		exit(1);
	}

	vector<string> bds;
	char linebuf[256];
	while(file.getline(linebuf, 256)) {
		bds.push_back(string(linebuf));
	}
	
	int nboards = (int)bds.size();
	printf("Testing perf on %d boards...\n", nboards);
	vector<string>::const_iterator it = bds.begin();
	vector<string>::const_iterator e = bds.end();
	unsigned score = 0;
	double start = secs();
	for (; it != e; ++it) {
		score += b->Score(it->c_str());
	}
	double end = secs();
	
	printf("%d boards in %.5f secs => %.2f bds/sec\n",
         nboards, end-start, 1.0*nboards/(end-start));

	printf("Average board score: %.4f pts/bd\n", 1.0*score/nboards);
}

double secs() {
  struct timeval t;
  gettimeofday(&t, NULL);
  return t.tv_sec + t.tv_usec / 1000000.0;
}
