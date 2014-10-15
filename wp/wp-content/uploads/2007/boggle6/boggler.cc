#include "boggler.h"
#include "trie.h"

Boggler::Boggler(){
	for (int i=0; i<4; i++)
		for (int j=0; j<4; j++)
			prev_[i][j] = false;
	score_ = 0;
	num_boards_ = 1;
	dict_ = NULL;
}

int Boggler::LoadDictionary(const char* filename) {
	if (dict_) delete dict_;
	dict_ = new Trie;
	return dict_->LoadFile(filename);
}

void ClearMarks(Trie* t) {           // NEW
	t->Mark(0);                        // NEW
	for (int i=0; i<kNumLetters; i++)  // NEW
		if (t->StartsWord(i))            // NEW
			ClearMarks(t->Descend(i));     // NEW
}

static const int kWordScores[] = 
//0, 1, 2, 3, 4, 5, 6, 7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17
{ 0, 0, 0, 1, 1, 2, 3, 5, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11 };

// Returns the score from this portion of the search
void Boggler::Solve(int x, int y, int len, Trie* t) {
	prev_[x][y] = true;

	len += (bd_[x][y]=='q'-'a' ? 2 : 1);
	if (t->IsWord()) {
		if (t->Mark() != num_boards_) { // NEW
			score_ += kWordScores[len];   // NEW
			t->Mark(num_boards_);         // NEW
		}
	}

	for (int dx=-1; dx<=1; ++dx) {
		int cx = x + dx;
		if (cx<0 || cx>3) continue;
		for (int dy=-1; dy<=1; ++dy) {
			int cy = y + dy;
			if (cy<0 || cy>3) continue;
			if (prev_[cx][cy]) continue;
			if (t->StartsWord(bd_[cx][cy]))
				Solve(cx, cy, len, t->Descend(bd_[cx][cy]));
		}
	}
	
	prev_[x][y] = false;
}
int Boggler::Score(const char* letters) {
	if (!ParseBoard(letters)) return -1;

	score_ = 0;
	for (int i=0; i<16; ++i)
		Solve(i/4, i%4, 0, dict_->Descend(bd_[i/4][i%4]));

	num_boards_++;        // NEW
	if (!num_boards_) {   // NEW
		ClearMarks(dict_);  // NEW
		num_boards_ = 1;    // NEW
	}
	return score_;
}

// Board format: "bcdefghijklmnopq"
bool Boggler::ParseBoard(const char* lets) {
	for (int i=0; i<16; i++) {
		if (!lets[i] || lets[i]<'a' || lets[i]>'z') return false;
		bd_[i/4][i%4] = lets[i] - 'a';
	}
	return true;
}