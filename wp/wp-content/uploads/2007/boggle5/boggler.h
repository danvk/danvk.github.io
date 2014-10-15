#ifndef BOGGLER_H
#define BOGGLER_H

#include <ext/hash_set>
#include <inttypes.h>      // for uintptr_t
using namespace __gnu_cxx; // for hash_set
class Trie;

class Boggler {
 public:
	Boggler();
  int LoadDictionary(const char* filename);
	int Score(const char* bd);
	
 private:
	bool ParseBoard(const char* lets);
	void Solve(int x, int y, int len, Trie* t);
	
	hash_set<uintptr_t> found_;
	int bd_[4][4];
	bool prev_[4][4];
	int score_;
	Trie* dict_;
};

#endif