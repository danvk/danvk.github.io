#include "boggler.h"

#include <string>
#include <iostream>
using namespace std;

int main(int argc, char** argv) {
	Boggler b;
	int words = b.LoadDictionary("words");
	cout << "Loaded " << words << " words." << endl;
	
	cout << "b.Score(abcd...) => " << b.Score("a b c d e f g h i j k l m n o p") 
	     << " == 18?" << endl;
	cout << "b.Score(qu...) => " << b.Score("t c e e v w h b t s t u qu a a e") 
	     << " == 94?" << endl;
	cout << "b.Score(catd...) => " << b.Score("c a t d l i n e m a r o p e t s")
	     << " == 2338?" << endl;
}
