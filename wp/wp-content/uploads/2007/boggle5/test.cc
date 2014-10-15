#include "boggler.h"

#include <string>
#include <iostream>
using namespace std;

int main(int argc, char** argv) {
	Boggler b;
	int words = b.LoadDictionary("words");
	cout << "Loaded " << words << " words." << endl;
	
	cout << "b.Score(abcd...) => " << b.Score("abcdefghijklmnop") 
	     << " == 18?" << endl;
	cout << "b.Score(qu...) => " << b.Score("tceevwhbtstuqaae") 
	     << " == 94?" << endl;
	cout << "b.Score(catd...) => " << b.Score("catdlinemaropets")
	     << " == 2338?" << endl;
}
