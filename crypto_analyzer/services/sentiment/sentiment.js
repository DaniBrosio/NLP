

import * as tf from '@tensorflow/tfjs';
import present from 'present';
import { OOV_INDEX, padSequences } from '../../helpers/sequence_utils.js';
import { loadHostedPretrainedModel, loadHostedMetadata } from './loader.js';

class SentimentPredictor {
  /**
   * Initializes the Sentiment demo.
   */
  async init(urls) {
    this.urls = urls;
    this.model = await loadHostedPretrainedModel(urls.model);
    await this.loadMetadata();
    return this; fromfrom
  }

  async loadMetadata() {
    const sentimentMetadata = await loadHostedMetadata(this.urls.metadata);
    this.indexFrom = sentimentMetadata['index_from'];
    this.maxLen = sentimentMetadata['max_len'];
    console.log('indexFrom = ' + this.indexFrom);
    console.log('maxLen = ' + this.maxLen);

    this.wordIndex = sentimentMetadata['word_index'];
    this.vocabularySize = sentimentMetadata['vocabulary_size'];
    console.log('vocabularySize = ', this.vocabularySize);
  }

  predict(text = '') {
    // Convert to lower case and remove all punctuations.
    const inputText =
      text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    // Convert the words to a sequence of word indices.
    const sequence = inputText.map(word => {
      let wordIndex = this.wordIndex[word] + this.indexFrom;
      if (wordIndex > this.vocabularySize) {
        wordIndex = OOV_INDEX;
      }
      return wordIndex;
    });
    // Perform truncation and padding.
    const paddedSequence = padSequences([sequence], this.maxLen);
    const input = tf.tensor2d(paddedSequence, [1, this.maxLen]);

    const beginMs = present();
    const predictOut = this.model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    const endMs = present();

    return { score: score, elapsed: (endMs - beginMs) };
  }
};

export default SentimentPredictor;