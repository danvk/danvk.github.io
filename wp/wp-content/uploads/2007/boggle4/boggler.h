#ifndef BOGGLER_H
#define BOGGLER_H

#include <ext/hash_set>
#include <string>
using namespace __gnu_cxx; // for hash_set
using namespace std;       // for string

// WTF, Mac OS X?
namespace __gnu_cxx {
	template<> struct hash< std::string > {
		size_t operator()( const std::string& x ) const {
			return hash< const char* >()( x.c_str() );
		}
	};
}

class Boggler {
 public:
	Boggler();
	int LoadDictionary(const char* filename);
	int Score(const char* letters);
	
 private:
	bool ParseBoard(const char* lets);
	void Solve(int x, int y, const string& sofar);
	
	hash_set<string> words_;
	hash_set<string> stems_;
	hash_set<string> found_;
	string bd_[4][4];
	bool prev_[4][4];
	int score_;
};

#endif