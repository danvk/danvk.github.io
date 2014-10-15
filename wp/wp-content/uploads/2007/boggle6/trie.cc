#include "trie.h"

#include <string>
#include <fstream>
#include <iostream>
using namespace std;

inline int idx(char x) { return x - 'a'; }
const int kQ = 'q'-'a';

void Trie::AddWord(const char* wd) {
	if (!wd) return;
	if (!*wd) {
		is_word_ = true;
		return;
	}
	int c = idx(*wd);
	if (!StartsWord(c))
		children_[c] = new Trie;
	if (c!=kQ)
		Descend(c)->AddWord(wd+1);
	else // Skip the 'u' in 'qu'
		Descend(c)->AddWord(wd+2);
}

// Verify that the word has:
// - 3-17 letters
// - only a-z
// - no 'q' w/o a 'u'
bool IsBoggleWord(const string& wd) {
	if (wd.size()<3 || wd.size()>17) return false;
	for (unsigned i=0; i<wd.size(); ++i) {
		int c = idx(wd[i]);
		if (c<0 || c>=kNumLetters) return false;
		if (c==kQ && (i+1 >= wd.size() || idx(wd[1+i]) != idx('u'))) return false;
	}
	return true;
}

int Trie::LoadFile(const char* filename) {
	ifstream file(filename);
	if (!file)
		return -1;
	
	string line;
	int words = 0;
	while (file >> line) {
		if (!IsBoggleWord(line)) continue;
		
		AddWord(line.c_str());
		words += 1;
	}
	
	return words;
}

bool Trie::IsWord(const char* wd) const {
	if (!wd) return false;
	if (!*wd) return IsWord();
	
	int c = idx(*wd);
	if (c<0 || c>=kNumLetters) return false;
	
	if (StartsWord(c)) {
		if (c==kQ && wd[1] == 'u') return Descend(c)->IsWord(wd+2);
		return Descend(c)->IsWord(wd+1);
	}
	return false;
}

unsigned int Trie::size() const {
	unsigned int size = 0;
	if (IsWord()) size++;
	for (int i=0; i<26; i++) {
		if (StartsWord(i)) size += Descend(i)->size();
	}
	return size;
}

// Initially, this node is empty
Trie::Trie() {
	for (int i=0; i<kNumLetters; i++) {
		children_[i] = NULL;
	}
	is_word_ = false;
	mark_ = 0;
}

Trie::~Trie() {
	for (int i=0; i<26; i++) {
		if (children_[i]) delete children_[i];
	}
}