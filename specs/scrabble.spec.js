const Scrabble = require('../scrabble');

describe('score', () => {
  test('is defined', () => {
    expect(Scrabble.score).toBeDefined();
  });

  test('correctly scores simple words', () => {
    expect(Scrabble.score('dog')).toBe(5);
    expect(Scrabble.score('cat')).toBe(5);
    expect(Scrabble.score('pig')).toBe(6);
  });

  test('adds 50 points for a 7-letter word', () => {
    expect(Scrabble.score('academy')).toBe(65);
  });

  test('throws on bad characters', () => {
    expect(() => {
      Scrabble.score('char^');
    }).toThrow();
  });

  test('handles all upper- and lower-case letters', () => {
    expect(Scrabble.score('dog')).toBe(5);
    expect(Scrabble.score('DOG')).toBe(5);
    expect(Scrabble.score('DoG')).toBe(5);
  });

  test('does not allow words > 7 letters', () => {
    expect(() => { Scrabble.score('abcdefgh'); }).toThrow();
  });

  test('does not allow empty words', () => {
    expect(() => { Scrabble.score(''); }).toThrow();
  });
});

describe('highestScoreFrom', () => {
  test('is defined', () => {
    expect(Scrabble.highestScoreFrom).toBeDefined();
  });

  test('throws if no words were passed', () => {
    expect(() => { Scrabble.highestScoreFrom([]); }).toThrow();
    expect(() => { Scrabble.highestScoreFrom('not array'); }).toThrow();
  });

  test('returns the only word in a length-1 array', () => {
    expect(Scrabble.highestScoreFrom(['dog'])).toBe('dog');
  });

  test('returns the highest word if there are two words', () => {
    // Check score assumptions
    expect(Scrabble.score('dog')).toBe(5);
    expect(Scrabble.score('pig')).toBe(6);

    // Test the functionality
    expect(Scrabble.highestScoreFrom(['dog', 'pig'])).toBe('pig');
    expect(Scrabble.highestScoreFrom(['pig', 'dog'])).toBe('pig');
  });

  test('if tied, prefer a word with 7 letters', () => {
    const loser = 'zzzzzz';
    const winner = 'iiiiddd';

    // Check score assumptions
    expect(Scrabble.score(loser)).toBe(60);
    expect(Scrabble.score(winner)).toBe(60);

    // Test functionality
    expect(Scrabble.highestScoreFrom([loser, winner])).toBe(winner);
    expect(Scrabble.highestScoreFrom([winner, loser])).toBe(winner);
  });

  test('if tied and no word has 7 letters, prefers the word with fewer letters', () => {
    // Check score assumptions
    expect(Scrabble.score('dog')).toBe(5);
    expect(Scrabble.score('goat')).toBe(5);

    // Test functionality
    expect(Scrabble.highestScoreFrom(['dog', 'goat'])).toBe('dog');
    expect(Scrabble.highestScoreFrom(['goat', 'dog'])).toBe('dog');
  });

  test('returns the first word of a tie with same letter count', () => {
    // Check score assumptions
    expect(Scrabble.score('i')).toBe(1);
    expect(Scrabble.score('dog')).toBe(5);
    expect(Scrabble.score('cat')).toBe(5);

    // Test the functionality
    expect(Scrabble.highestScoreFrom(['dog', 'dog'])).toBe('dog');
    expect(Scrabble.highestScoreFrom(['dog', 'cat'])).toBe('dog');
    expect(Scrabble.highestScoreFrom(['cat', 'dog'])).toBe('cat');
    expect(Scrabble.highestScoreFrom(['i', 'dog', 'cat'])).toBe('dog');
  });
});

describe('Player', () => {
  test('is defined', () => {
    expect(Scrabble.Player).toBeDefined();
  });

  describe('Constructor', () => {
    test('Creates a new player', () => {
      const name = 'test name';
      const player = new Scrabble.Player(name);

      expect(player.name).toBe(name);
    });

    test('Requires a name', () => {
      expect(() => {
        new Scrabble.Player();
      }).toThrow();
    });
  });

  describe('play', () => {
    test('Records the played word', () => {
      const word = 'dog';
      const player = new Scrabble.Player('test player');

      expect(player.plays.length).toBe(0);

      expect(player.play(word)).toBeTruthy();

      expect(player.plays.length).toBe(1);
      expect(player.plays[0]).toBe(word);
    });

    test('Requires a real word', () => {
      const player = new Scrabble.Player('test player');

      expect(player.plays.length).toBe(0);

      expect(() => { player.play(); }).toThrow();
      expect(player.plays.length).toBe(0);

      expect(() => { player.play(44); }).toThrow();
      expect(player.plays.length).toBe(0);
    });

    test('Returns false and does not update plays if the player has already won', () => {
      const player = new Scrabble.Player('test player');

      expect(player.play('zzzzzzz')).toBeTruthy(); // +120 pts
      expect(player.plays.length).toBe(1);
      expect(player.hasWon()).toBeTruthy();

      expect(player.play('dog')).toBe(false);
      expect(player.plays.length).toBe(1);
    });
  });

  describe('totalScore', () => {
    test('Is zero if the player has not played anything', () => {
      const player = new Scrabble.Player('test player');

      expect(player.totalScore()).toBe(0);
    });

    test('Is updated by play', () => {
      // Arrange
      const player = new Scrabble.Player('test player');
      const words = [{word: 'dog', score: 5}, {word: 'cat', score: 5}, {word: 'goat', score: 5}];
      let totalScore = 0;

      expect(player.totalScore()).toBe(0);
      words.forEach((testWords) => {
        // Act
        player.play(testWords.word);
        totalScore += testWords.score;

        // Assert
        expect(player.totalScore()).toBe(totalScore);
      });

    });
  });

  describe('hasWon', () => {
    test('returns false when score < 100', () => {
      const player = new Scrabble.Player('test player');

      player.play('alcohol');


      expect(player.totalScore()).toBe(62);
      expect(player.hasWon()).toBe(false);


      player.play('cookie');


      expect(player.totalScore()).toBe(74);
      expect(player.hasWon()).toBe(false);


    });


    test('returns true when score == 100', () => {
      const player = new Scrabble.Player('test player');

      player.play('QQQQQ');
      player.play('ZZZZZ');


      expect(player.totalScore()).toBe(100);
      expect(player.hasWon()).toBe(true);

    });

    test('returns true when score > 100', () => {
      const player = new Scrabble.Player('test player');

      player.play('squeeze');
      player.play('jukebox');


      expect(player.totalScore()).toBe(152);
      expect(player.hasWon()).toBe(true);

    });
  });

  describe('highestScoringWord', () => {
    // Tie-breaking logic is already described in the tests
    // for highestWordFrom, so we will not repeat it here.
    test('returns the highest scoring word played', () => {
      const player = new Scrabble.Player('test player');

      player.play('QQQQQ');
      player.play('KKKKK');

      expect(Scrabble.score('QQQQQ')).toBe(50);
      expect(Scrabble.score('KKKKK')).toBe(25);
      expect(player.highestScoringWord()).toBe('QQQQQ');

    });

    test('throws an error if no words have been played', () => {
      const player = new Scrabble.Player('test player');
      expect(() => { player.highestScoringWord() }).toThrow();
    });
  });

  describe('highestWordScore', () => {
    test('returns the score of the highest scoring word played', () => {
      const player = new Scrabble.Player('test player');
      player.play('QQQQQ');
      player.play('KKKKK');

      expect(player.highestWordScore()).toBe(50);

    });

    test('throws an error if no words have been played', () => {
      const player = new Scrabble.Player('test player');
      expect(() => { player.highestScoringWord() }).toThrow();

    });
  });
});

// optional enchancements tests
describe('TileBag', () => {
  test('is defined', () => {
    expect(Scrabble.TilesBag).toBeDefined();
  });

  describe('constructor', () => {
    test('creates a new tile bag', () => {
      const tileBag = new Scrabble.TilesBag();

      expect(tileBag.tiles.length).toEqual(98);
    });

  });

  describe('drawTiles', () => {
    test('returns a collection of tiles', () => {
      const tileBag = new Scrabble.TilesBag();
      let tiles = tileBag.drawTiles(5);

      expect(tiles.length).toEqual(5);

    });

    test('throws error if not enough tiles', () => {
      const tileBag = new Scrabble.TilesBag();

      // a loop to use tiles
      for (let i = 0; i < 10; i+=1) {
        tileBag.drawTiles(9);
      }

      // try to get more tiles than the amount available
      expect(() => { tileBag.drawTiles(10); }).toThrow();
    });

    test('removes the tile from the array of tiles', () => {
      const tileBag = new Scrabble.TilesBag();

      tileBag.drawTiles(2);

      expect(tileBag.tiles.length).toEqual(96);
    });


  });

  describe('tilesRemaining', () => {
    test('returns the amount of tiles remaining in the tiles bag', () => {
      const tileBag = new Scrabble.TilesBag();

      tileBag.drawTiles(4);

      expect(tileBag.tilesRemaining()).toEqual(94);
    });

    test('returns "No more tiles in the bag" if no tiles left in the bag', () => {
      const tileBag = new Scrabble.TilesBag();

      // a loop to use all the tiles
      for (let i = 0; i < 14; i++) {
        tileBag.drawTiles(7);
      }

      expect(tileBag.tilesRemaining()).toEqual('No more tiles in the bag');
    });


  });


});
