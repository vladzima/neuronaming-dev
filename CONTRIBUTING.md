# How to contribute

Please keep in mind, that initial version was create in 2015, so there could be outdates dependencies and such. Also, the model approach is pretty old, so any contribution to the ML part is highly appreciated.

## Data available

1) An archive of every checkpoint of model training for each category (heavy lifting alert: ~3.5GB) is available [here](https://storage.googleapis.com/nnnet_storage/cv_full.cpgz).
2) Initial pre-processed training data (list of UK business names by category) in CSV format is available [here](https://storage.googleapis.com/nnnet_storage/data.cpgz).

## Submitting changes

This project uses [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) provided by [Commitizen](https://github.com/commitizen/cz-cli).

1) To commit your changes first run:
```
npm install commitizen -g && npm install -g cz-conventional-changelog
```
2) And then use `git cz` instead of `git commit` (`cz` works with all standard git parameters, [more](https://github.com/commitizen/cz-cli) on the usage). You will be presented with a prompt, please choose your options carefully.

Please send a [GitHub Pull Request to neuronaming-dev](https://github.com/vladzima/neuronaming-dev/pull/new/master) with a clear list of what you've done (read more about [pull requests](https://help.github.com/en/articles/about-pull-requests)).

**Changes to `gh-pages` branch will not be merged. Please commit to `master`.**
