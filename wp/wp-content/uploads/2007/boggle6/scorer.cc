#include <iostream>
using namespace std;

#include "boggler.h"

int main(int argc, char** argv) {
	Boggler b;
	b.LoadDictionary("words");

	char linebuf[256];
	while (cin.getline(linebuf, 256)) {
		cout << b.Score(linebuf) << endl;
	}
}