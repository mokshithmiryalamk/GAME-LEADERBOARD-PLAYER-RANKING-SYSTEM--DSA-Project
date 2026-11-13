/**
 * GAME LEADERBOARD - PRE-VALIDATED SEED DATA
 * Extracted deterministically from `original-source/players.txt` (commit 9997165)
 *
 * Audit Results:
 * - Total lines in players.txt: 54
 * - Valid parsed records: 53
 * - Rejected / quarantined rows: 1 (Line 50: two records concatenated without newline)
 *
 * Normalization Decisions:
 * - "NoTeam" or empty represents a solo player without team affiliation.
 * - Team names are trimmed and normalized to canonical casing ('KLH' for 'klh').
 */

(function (window) {
  'use strict';

  const SEED_METADATA = {
    sourceFile: 'original-source/players.txt',
    sourceCommit: '9997165e4524f2e0e4f820b0ea5538c0f5c45401',
    totalLines: 54,
    validCount: 53,
    rejectedCount: 1,
    rejectedRecords: [
      {
        lineNum: 50,
        rawText: 'Shreya,150,90,5,Dragonshi,254,0,55,noiy',
        reason: 'Malformed row: Field count is 9. Two player records were concatenated on a single line without a newline delimiter.'
      }
    ]
  };

  const VALID_SEED_PLAYERS = [
    { id: 101, name: 'Amit', score: 80, level: 2, team: 'NoTeam' },
    { id: 102, name: 'Rahul', score: 90, level: 4, team: 'Warriors' },
    { id: 103, name: 'Neha', score: 90, level: 3, team: 'Knights' },
    { id: 104, name: 'Arjun', score: 100, level: 5, team: 'Warriors' },
    { id: 105, name: 'Kiran', score: 60, level: 2, team: 'NoTeam' },
    { id: 106, name: 'Ravi', score: 70, level: 3, team: 'Dragons' },
    { id: 107, name: 'Sneha', score: 90, level: 4, team: 'Knights' },
    { id: 108, name: 'Vikram', score: 70, level: 2, team: 'NoTeam' },
    { id: 109, name: 'Priya', score: 90, level: 5, team: 'Warriors' },
    { id: 110, name: 'Karthik', score: 70, level: 3, team: 'NoTeam' },
    { id: 111, name: 'Anjali', score: 80, level: 4, team: 'Dragons' },
    { id: 112, name: 'Rohan', score: 70, level: 2, team: 'NoTeam' },
    { id: 113, name: 'Meera', score: 90, level: 5, team: 'Knights' },
    { id: 114, name: 'Suresh', score: 80, level: 3, team: 'NoTeam' },
    { id: 115, name: 'Pooja', score: 80, level: 4, team: 'Warriors' },
    { id: 116, name: 'Manoj', score: 70, level: 2, team: 'NoTeam' },
    { id: 117, name: 'Lakshmi', score: 90, level: 5, team: 'Dragons' },
    { id: 118, name: 'Varun', score: 70, level: 3, team: 'NoTeam' },
    { id: 119, name: 'Deepa', score: 90, level: 4, team: 'Knights' },
    { id: 120, name: 'Nikhil', score: 70, level: 3, team: 'Warriors' },
    { id: 121, name: 'Harsha', score: 80, level: 3, team: 'NoTeam' },
    { id: 122, name: 'Divya', score: 90, level: 4, team: 'Knights' },
    { id: 123, name: 'Teja', score: 70, level: 2, team: 'NoTeam' },
    { id: 124, name: 'Swathi', score: 80, level: 3, team: 'Dragons' },
    { id: 125, name: 'Ajay', score: 90, level: 5, team: 'Warriors' },
    { id: 126, name: 'Kavya', score: 80, level: 3, team: 'NoTeam' },
    { id: 127, name: 'Sunil', score: 70, level: 2, team: 'NoTeam' },
    { id: 128, name: 'Keerthi', score: 90, level: 4, team: 'Knights' },
    { id: 129, name: 'Tarun', score: 70, level: 2, team: 'NoTeam' },
    { id: 130, name: 'Bhavana', score: 80, level: 3, team: 'Warriors' },
    { id: 131, name: 'Aditya', score: 80, level: 3, team: 'NoTeam' },
    { id: 132, name: 'Sanjana', score: 90, level: 4, team: 'Dragons' },
    { id: 133, name: 'Pradeep', score: 60, level: 2, team: 'NoTeam' },
    { id: 134, name: 'Nisha', score: 90, level: 5, team: 'Knights' },
    { id: 135, name: 'Aravind', score: 70, level: 3, team: 'NoTeam' },
    { id: 136, name: 'Preeti', score: 80, level: 3, team: 'Warriors' },
    { id: 137, name: 'Ganesh', score: 70, level: 2, team: 'NoTeam' },
    { id: 138, name: 'Shruthi', score: 90, level: 4, team: 'Dragons' },
    { id: 139, name: 'Mahesh', score: 70, level: 3, team: 'NoTeam' },
    { id: 140, name: 'Ritika', score: 80, level: 4, team: 'Knights' },
    { id: 141, name: 'Siddharth', score: 70, level: 2, team: 'NoTeam' },
    { id: 142, name: 'Aishwarya', score: 90, level: 5, team: 'Warriors' },
    { id: 143, name: 'Kunal', score: 70, level: 3, team: 'NoTeam' },
    { id: 144, name: 'Isha', score: 80, level: 4, team: 'Dragons' },
    { id: 145, name: 'Ramesh', score: 70, level: 2, team: 'NoTeam' },
    { id: 146, name: 'Tanvi', score: 90, level: 4, team: 'Knights' },
    { id: 147, name: 'Vivek', score: 80, level: 3, team: 'NoTeam' },
    { id: 148, name: 'Nandini', score: 80, level: 4, team: 'Warriors' },
    { id: 149, name: 'Lokesh', score: 70, level: 2, team: 'NoTeam' },
    { id: 155, name: 'Rohit', score: 0, level: 5, team: 'KLH' },
    { id: 156, name: 'Sandeep', score: 0, level: 7, team: 'KLH' },
    { id: 45,  name: 'ad', score: 0, level: 5, team: 'KLH' },
    { id: 89,  name: 'hj', score: 0, level: 58, team: 'KLH' }
  ];

  window.GameSeedData = {
    metadata: SEED_METADATA,
    getSeedPlayers: function () {
      // Returns a deep copy so seed baseline cannot be mutated
      return JSON.parse(JSON.stringify(VALID_SEED_PLAYERS));
    }
  };

})(typeof window !== 'undefined' ? window : global);
