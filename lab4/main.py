import nltk
# nltk.download()

from nltk.book import *
from nltk.corpus import wordnet as wn

dog_synsets = wn.synsets('dog')
print(
    dog_synsets)  # [Synset('dog.n.01'), Synset('frump.n.01'), Synset('dog.n.03'), Synset('cad.n.01'), Synset('frank.n.02'), Synset('pawl.n.01'), Synset('andiron.n.01'), Synset('chase.v.01')]

dog_synsets_as_verb = wn.synsets('dog', pos=wn.VERB)
print(dog_synsets_as_verb)  # [Synset('chase.v.01')]

dog_first_synset = wn.synset('dog.n.01')
dog_second_synset = wn.synset('dog.n.02')
frump_first_synset = wn.synset('frump.n.01')

print(dog_first_synset, dog_second_synset,
      frump_first_synset)  # Synset('dog.n.01') Synset('frump.n.01') Synset('frump.n.01')

dog_first_synset_def = dog_first_synset.definition()
dog_second_synset_def = dog_second_synset.definition()
frump_first_synset_def = frump_first_synset.definition()

print(
    dog_first_synset_def)  # a member of the genus Canis (probably descended from the common wolf) that has been domesticated by man since prehistoric times; occurs in many breeds
print(dog_second_synset_def)  # a dull unattractive unpleasant girl or woman
print(frump_first_synset_def)  # a dull unattractive unpleasant girl or woman

dog_first_synset_lemmas = dog_first_synset.lemmas()
dog_second_synset_lemmas = dog_second_synset.lemmas()
frump_first_synset_lemmas = frump_first_synset.lemmas()

print(
    dog_first_synset_lemmas)  # [Lemma('dog.n.01.dog'), Lemma('dog.n.01.domestic_dog'), Lemma('dog.n.01.Canis_familiaris')]
print(dog_second_synset_lemmas)  # [Lemma('frump.n.01.frump'), Lemma('frump.n.01.dog')]
print(frump_first_synset_lemmas)  # [Lemma('frump.n.01.frump'), Lemma('frump.n.01.dog')]

print(len(dog_first_synset.examples()))  # 1

print(dog_first_synset.examples()[0])  # the dog barked all night

print(dog_first_synset_lemmas)

dog_first_synset_lemmas  # [Lemma('dog.n.01.dog'), Lemma('dog.n.01.domestic_dog'), Lemma('dog.n.01.Canis_familiaris')]

lemmas_names = [str(lemma.name()) for lemma in dog_first_synset_lemmas]
print(lemmas_names)  # ['dog', 'domestic_dog', 'Canis_familiaris']

synset_from_lemma = wn.lemma('dog.n.01.dog').synset()
print(synset_from_lemma)  # Synset('dog.n.01')

dog = dog_first_synset
dog_hypernyms = dog.hypernyms()
dog_hyponyms = dog.hyponyms()
print(dog_hypernyms)  # [Synset('canine.n.02'), Synset('domestic_animal.n.01')]
print(
    dog_hyponyms)  # [Synset('basenji.n.01'), Synset('corgi.n.01'), Synset('cur.n.01'), Synset('dalmatian.n.02'), Synset('great_pyrenees.n.01'), Synset('griffon.n.02'), Synset('hunting_dog.n.01'), Synset('lapdog.n.01'), Synset('leonberg.n.01'), Synset('mexican_hairless.n.01'), Synset('newfoundland.n.01'), Synset('pooch.n.01'), Synset('poodle.n.01'), Synset('pug.n.01'), Synset('puppy.n.01'), Synset('spitz.n.01'), Synset('toy_dog.n.01'), Synset('working_dog.n.01')]

good = wn.synset('good.a.01')
good_lemmas = good.lemmas()
print(good_lemmas)  # [Lemma('good.a.01.good')]

g0 = good_lemmas[0]
g0_antonyms = g0.antonyms()
print(g0)  # Lemma('good.a.01.good')
print(g0_antonyms)  # [Lemma('bad.a.01.bad')]

print(dog.part_meronyms())  # [Synset('flag.n.07')]
print(dog.member_meronyms())  # []
print(dog.part_holonyms())  # []
print(dog.member_holonyms())  # [Synset('canis.n.01'), Synset('pack.n.06')]

flag_seventh_synset_def = wn.synset('flag.n.07').definition()
print(flag_seventh_synset_def)  # a conspicuously marked or shaped tail
# se puede estár refiriendo a la cola de un perro.

canis_first_synset_def = wn.synset('canis.n.01').definition()
print(canis_first_synset_def)  # type genus of the Canidae: domestic and wild dogs; wolves; jackals
# se refiere a la genetica de un perro

pack_sixth_synset_def = wn.synset('pack.n.06').definition()
print(pack_sixth_synset_def)  # a group of hunting animals
# se puede estar refiriendo a una manada de perros

bank_synsets = wn.synsets('bank')
print(
    bank_synsets)  # [Synset('bank.n.01'), Synset('depository_financial_institution.n.01'), Synset('bank.n.03'), Synset('bank.n.04'), Synset('bank.n.05'), Synset('bank.n.06'), Synset('bank.n.07'), Synset('savings_bank.n.02'), Synset('bank.n.09'), Synset('bank.n.10'), Synset('bank.v.01'), Synset('bank.v.02'), Synset('bank.v.03'), Synset('bank.v.04'), Synset('bank.v.05'), Synset('deposit.v.02'), Synset('bank.v.07'), Synset('trust.v.01')]
# 10 synsets de bank como sustantivo

bank_synset_definitions = [print(str(synset) + ') ' + str(synset.definition())) for synset in bank_synsets[0:10]]
# 1) 'sloping land (especially the slope beside a body of water)',
# 👉 2) 'a financial institution that accepts deposits and channels the money into lending activities',
# 3) 'a long ridge or pile',
# 4) 'an arrangement of similar objects in a row or in tiers',
# 5) 'a supply or stock held in reserve for future use (especially in emergencies)',
# 6) 'the funds held by a gambling house or the dealer in some gambling games',
# 7) 'a slope in the turn of a road or track; the outside is higher than the inside in order to reduce the effects of centrifugal force',
# 8) 'a container (usually with a slot in the top) for keeping money at home',
# 9) 'a building in which the business of banking transacted'
# 10) 'a flight maneuver; aircraft tips laterally about its longitudinal axis (especially in turning)'
from nltk.wsd import lesk
from nltk import word_tokenize

S = "The bank can guarantee deposits will eventually cover future tuition costs because it invests in adjustable-rate " \
    "mortgage securities. "
S_tok = word_tokenize(S)
print(lesk(S_tok, "bank", "n")) # Synset('bank.n.05')
# 5) 'a supply or stock held in reserve for future use (especially in emergencies)',

l = word_tokenize((wn.synset('bank.n.05').definition()))
print(l)
m = word_tokenize((wn.synset('bank.n.02').definition()))
print(m)
k = set(S_tok)
print(k)
print(k.intersection(l))
print(k.intersection(m))
# la definicion del synset 05 tiene una interseccion con la oracion analyzada mayor
# que la interseccion entre esta misma y la definicion del synset 02

"""
I went to the bank to deposit some money. bank.n.02
She created a big mess of the birthday cake.
In the interest of your safety, please wear your seatbelt. 
I drank some ice cold water. 
"""

from nltk.stem import WordNetLemmatizer
wnLemmatizer = WordNetLemmatizer()
print(wnLemmatizer.lemmatize('dogs', 'n')) # dog
print(wnLemmatizer.lemmatize('walking', 'v')) # walk
print(wnLemmatizer.lemmatize('dogs')) # dog