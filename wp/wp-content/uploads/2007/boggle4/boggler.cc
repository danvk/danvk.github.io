#include "boggler.h"

#include <fstream>
#include <sstream>

Boggler::Boggler() {
	for (int i=0; i<4; i++)
		for (int j=0; j<4; j++)
			bd_[i][j] = "", prev_[i][j] = false;
	score_ = 0;
}

bool IsBoggleWord(const string& wd) {
	if (wd.size()<3 || wd.size()>17) return false;
	for (unsigned i=0; i<wd.size(); ++i) {
		if (wd[i]<'a' || wd[i]>'z') return false;
	}
	return true;
}

int Boggler::LoadDictionary(const char* filename) {
	ifstream file(filename);
	if (!file)
		return -1;
	
	string line;
	int words = 0;
	while (file >> line) {
		if (!IsBoggleWord(line)) continue;

		words_.insert(line);
		for (unsigned i=1; i<line.size(); ++i)
			stems_.insert(string(line,0,i));
		words += 1;
	}

	return words;
}

static const int kWordScores[] = 
//0, 1, 2, 3, 4, 5, 6, 7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17
{ 0, 0, 0, 1, 1, 2, 3, 5, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11 };

void Boggler::Solve(int x, int y, const string& sofar) {
	prev_[x][y] = true;
	
	string wd = sofar + bd_[x][y];
	if (words_.find(wd) != words_.end()) {
		if (found_.find(wd) == found_.end()) {
			found_.insert(wd);
			score_ += kWordScores[wd.size()];
		}
	}
	
	for (int dx=-1; dx<=1; ++dx) {
		int cx = x + dx;
		if (cx<0 || cx>3) continue;
		for (int dy=-1; dy<=1; ++dy) {
			int cy = y + dy;
			if (cy<0 || cy>3) continue;
			if (prev_[cx][cy]) continue;
			if (stems_.find(wd) != stems_.end())
				Solve(cx, cy, wd);
		}
	}
	
	prev_[x][y] = false;
}

int Boggler::Score(const char* letters) {
	if (!ParseBoard(letters)) return -1;

	score_ = 0;
	for (int i=0; i<16; ++i)
		Solve(i/4, i%4, "");
	found_.clear();
	return score_;
}

bool Boggler::ParseBoard(const char* lets) {
	istringstream istr(lets);
	int i=0;
	string cell;
	while (istr >> cell) {
		bd_[i/4][i%4] = cell;
		if (++i > 16) return false;
	}	
	return (i==16);
}