---
title: "5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라"
description: "5. 자원을 직접 명시하지 말고 의존 객체 주입을 사용하라"
date: 2021-07-17
update: 2021-07-17
tags:
  - Effective Java
  - 자바
series: "Effective Java Study"
---

많은 클래스가 하나 이상의 자원에 의존한다. 가령 맞춤법 검사기는 사전에 의존하는데 이런 클래스를 정적 유틸리티 클래스로 구현한 모습을 드물지 않게 볼 수 있다.

### 정적 유틸리티를 잘못 사용한 예

```java
// 유연하지 않고 테스트하기 어렵다.
public class SpellCheckerStaticUtility {
    private static final Lexicon dictionary = new KorLexicon();

    private SpellCheckerStaticUtility() {}

    public static boolean isValid(String word) {
        return dictionary.getWords().stream()
                .anyMatch(w -> w.equals(word));
    }
}
```

### 싱글턴을 잘못 사용한 예

```java
// 유연하지 않고 테스트하기 어렵다.
public class SpellCheckerSingleton {
    private final Lexicon dictionary = new KorLexicon();

    private SpellCheckerSingleton() {}

    private static SpellCheckerSingleton INSTANCE = new SpellCheckerSingleton();

    public boolean isValid(String word) {
        return dictionary.getWords().stream()
                .anyMatch(w -> w.equals(word));
    }
}
```

두 방식 모두 사전을 단 하나만 사용한다고 가정한다는 점에서 그리 훌륭해 보이지 않다. 실제로는 사전이 언어별, 기능별 사전을 별도로 두기도 하고 심지어 테스트용 사전도 필요할 수 있기 때문에 `사전 하나로 이 모든 쓰임에 대응하기 어렵다.`

### 다른 사전으로 교체하는 메서드를 추가한 방식

```java
public class SpellCheckerSetter {
    private static Lexicon dictionary;

    private SpellCheckerSetter() {}

    public static boolean isValid(String word) {
        return dictionary.getWords().stream()
                .anyMatch(w -> w.equals(word));
    }

		// 다른 사전으로 교체하는 메서드
		public static void setLexicon(Lexicon lexicon) {
        dictionary = lexicon;
    }
}
```

이 방식은 어색하고 오류를 내기 쉬우며 멀티스레드 환경에서 쓸 수 없다. `사용하는 자원에 따라 동작이 달라지는 클래스에는 정적 유틸리티 클래스나 싱글턴 방식이 적합하지 않다.`

```java
@Test
@DisplayName("다른 사전으로 교체하는 메서드를 추가한 방식")
public void spellCheckerSetterTest() {
    EngLexicon engDictionary = new EngLexicon();
		// 영어사전으로 교체
    SpellCheckerSetter.setLexicon(engDictionary);
    assertThat(true).isEqualTo(SpellCheckerSetter.isValid("A"));

		// 국어사전으로 교체
    KorLexicon korDictionary = new KorLexicon();
    SpellCheckerSetter.setLexicon(korDictionary);
    assertThat(true).isEqualTo(SpellCheckerSetter.isValid("가"));
}
```

### 의존 객체 주입 방식

대신 클래스(SpellChecker)가 여러 자원 인스턴스를 지원해야 하며, 클라이언트가 원하는 자원(dictionary)을 사용해야 한다. 이 조건을 만족하는 간단한 패턴이 인스턴스를 생성할 때 생성자에 필요한 자원을 넘겨주는 방식이다.

```java
public class SpellChecker {
    private final Lexicon dictionary;

		// 인스턴스를 생성할 때 생성자에 필요한 자원을 넘겨받는다.
    public SpellChecker(Lexicon dictionary) {
        this.dictionary = Objects.requireNonNull(dictionary);
    }

    public boolean isValid(String word) {
        return dictionary.getWords().stream()
                .anyMatch(w -> w.equals(word));
    }
}
```

의존 객체 주입 패턴을 사용하면 `자원이 몇 개든 의존 관계가 어떻든 상관없이 잘 작동`한다. 또한 `불변을 보장`하여 (같은 자원을 사용하려는) `여러 클라이언트가 의존 객체들을 안심하고 공유`할 수 있기도 하다. 의존 객체 주입은 생성자, 정적 팩터리, 빌더 모두에 똑같이 응용할 수 있다.

```java
@Test
@DisplayName("의존 객체 주입 방식")
public void spellCheckerTest() {
    // 영어사전에서 검색하고 싶으면 영어사전을 주입한다.
    EngLexicon engDictionary = new EngLexicon();
    SpellChecker engSpellChecke = new SpellChecker(engDictionary);
    assertThat(true).isEqualTo(engSpellChecker.isValid("A"));

    // 국어사전에서 검색하고 싶으면 국어사전을 주입한다.
    KorLexicon korDictionary = new KorLexicon();
    SpellChecker korSpellChecker = new SpellChecker(korDictionary);
    assertThat(true).isEqualTo(korSpellChecker.isValid("가"));
}
```

### 정리

- 클래스가 내부적으로 하나 이상의 자원에 의존하고, 그 자원이 클래스 동작에 영향을 준다면 싱글턴과 정적 유틸리티 클래스는 사용하지 않는 것이 좋다. 이 자원들을 클래스가 직접 만들게 해서도 안된다.
- 대신 필요한 자원을 (혹은 그 자원을 만들어주는 팩터리를) 생성자에 (혹은 정적 팩터리나 빌더에) 넘겨주자.
- 의존 객체 주입이 유연성과 테스트 용이성을 개선해주긴 하지만, 의존성이 수천 개나 되는 큰 프로젝트에서는 코드를 어지럽게 만들기도 한다.
- 이는 `스프링, 대거와 같은 의존 객체 주입 프레임워크`를 사용하면 이런 어질러짐을 해소할 수 있다.

### 참고

- Effective Java 3/E (조슈아 블로크)