#ifndef TRIE_H
#define TRIE_H

const int kNumLetters = 26;

class Trie {
 public:
	Trie();
	virtual ~Trie();
	
	// FAST access functions
	inline bool IsWord() const { return is_word_; }
	inline bool StartsWord(int i) const { return children_[i]; }
	inline Trie* Descend(int i) const { return children_[i]; }
	
	// Slower utility functions
	void AddWord(const char* wd);
	int LoadFile(const char* filename);
	bool IsWord(const char* wd) const;
	unsigned int size() const;
	
	inline void Mark(unsigned mark) { mark_ = mark; }
	inline unsigned Mark() const { return mark_; }
	
 private:
	Trie* children_[kNumLetters];
	bool is_word_;
	int mark_;
};

#endif