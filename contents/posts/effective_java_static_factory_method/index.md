---
title: "1. 생성자 대신 정적 팩터리 메서드를 고려하라"
description: "1. 생성자 대신 정적 팩터리 메서드를 고려하라"
date: 2021-04-02
update: 2021-04-02
tags:
  - Effective Java
  - log
series: "Test Code로 보는 Effective Java"
---

클라이언트가 클래스의 인스턴스를 얻는 방법은 public 생성자와 정적 팩터리 메서드를 이용해 얻을수 있다. 전통적인 방법인 public 생성자 방식이 아닌 정적 팩터리 메서드의 장점과 단점에 대해 알아보자.

## 장점

### 첫 번째, 이름을 가질 수 있다.

- **생성자**는 매개변수와 생성자 자체만으로 반환될 객체의 특성을 제대로 설명하지 못한다.
- **정적 팩터리 메서드**는 이름으로 반환될 객체의 특성을 쉽게 설명한다.

아래와 같이 **정적 팩터리 메서드**가 **생성자**보다 값이 소수인 BigInteger를 반환한다는 의미를 더 잘 설명한다.

```java
BigInteger(int, int, Random)                 // 생성자
BigInteger.probablePrime(int, Random)        // 정적 팩터리 메서드
```

- 하나의 **시그니처**로는 **생성자**를 하나만 만들 수 있다. (매개변수 순서, 타입, 개수가 같은 생성자는 여러개 만들수 없다.)
- 한 클래스에 **시그니처**가 같은 생성자가 여러 개 필요할 것 같으면 **정적 팩터리 메서드**로 바꾸고 각각의 차이를 잘 드러내는 이름을 지어주자.
    
    > 자바 시그니처는 메서드 명과 매개변수의 순서, 타입, 개수를 의미한다.
    > 

### 두 번째, 호출될 때마다 인스턴스를 새로 생성하지는 않아도 된다.

- **불변 클래스(immutable class)**는 인스턴스를 미리 만들어 놓거나 새로 생성한 인스턴스를 캐싱하여 재활용하는 식으로 **불필요한 객체 생성을 피할 수 있다.**
    
    ```java
    Boolean.valueOf(boolean) // 미리 생성된 객체를 재활용한다.
    ```
    
    ```java
    // Boolean 클래스의 valueOf 내부 구현
    public final class Boolean implements java.io.Serializable, Comparable<Boolean> {
    		public static final Boolean TRUE = new Boolean(true);
    		public static final Boolean FALSE = new Boolean(false);
    		...
    		@HotSpotIntrinsicCandidate
    		public static Boolean valueOf(boolean b) {
    		    return (b ? TRUE : FALSE);
    		}
    }
    ```
    
- 생성 비용이 큰 객체가 자주 요청되는 상황이라면 성능을 상당히 끌어올려 준다.
- 정적 팩터리 방식의 클래스는 언제 어느 인스턴스를 살아 있게 할지를 철저히 통제(인스턴스 통제(instance-controlled) 클래스)할 수 있다.
    - 클래스를 **싱글턴(singleton)**으로 만들 수도 있다.
    - **인스턴스화 불가(noninstantiable)** 로 만들 수도 있다.
    - 불변 값 클래스에서 동치인 인스턴스가 단 하나뿐임을 보장할 수 있다. (a == b 일 때만 a.equals(b)가 성립)

### 세 번째, 반환 타입의 하위 타입 객체를 반환할 수 있는 능력이 있다.

### 네 번째, 입력 매개변수에 따라 매번 다른 클래스의 객체를 반환할 수 있다.

- **반환 타입**의 **하위 타입**이기만 하면 어떤 클래스의 객체를 반환하든 상관없다.

예를 들어 EnumSet 클래스는 **public 생성자 없이** 오직 **정적 팩터리만 제공**하는데, OpenJDK에서는 원소의 수에 따라 두가지 하위 클래스 중 하나의 인스턴스를 반환한다.

```java
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
		...
		if (universe.length <= 64)
				// 원소의 개수가 64개 이하면 원소들을 long 변수 하나로 관리(RegularEnumSet)
        return new RegularEnumSet<>(elementType, universe);
    else
				// 원소의 개수가 65개 이상이면 원소들을 long 배열로 관리(JumboEnumSet)
        return new JumboEnumSet<>(elementType, universe);
}
```

클라이언트는 이 두 클래스의 존재를 모르기 때문에 내부에서 변경되어도 클라이언트는 팩터리가 건네주는 객체가 어느 클래스의 인스턴스인지 알 수도 없고 알 필요도 없다. EnumSet의 하위 클래스이기만 하면 된다.

### 다섯 번째, 정적 팩터리 메서드를 작성하는 시점에는 반환할 객체의 클래스가 존재하지 않아도 된다.

## 단점

### 첫 번째, 상속을 하려면 public이나 protected 생성자가 필요하니 정적 팩터리 메서드만 제공하면 하위 클래스를 만들 수 없다.

- 컬렉션 프레임워크의 유틸리티 구현 클래스들은 상속할 수 없다.
- 상속보다 컴포지션을 사용하도록 유도하고 불변 타입으로 만들려면 이 제약이 오히려 장점으로 받아들일 수 도 있다.

### 두 번째, 정적 팩터리 메서드는 프로그래머가 찾기 어렵다.

 생성자처럼 API 설명에 명확히 드러나지 않으니 사용자는 API문서를 잘 써놓고 메서드 이름도 널리 알려진 규약을 따라 짓는 식으로 문제를 완화해줘야 한다. 아래는 정적 팩터리 메서드에 흔히 사용하는 명명 방식들이다.

**from**

- 매개변수를 하나 받아서 해당 타입의 인스턴스를 반환하는 형변환 메서드
    
    ```java
    Date d = Date.from(instant);
    ```
    

**of**

- 여러 매개변수를 받아 적합한 타입의 인스턴스를 반환하는 집계 메서드
    
    ```java
    Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
    ```
    

**valueOf**

- from과 of의 더 자세한 버전
    
    ```java
    BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);
    ```
    

**instance/getInstance**

- 매개변수로 명시한 인스턴스를 반환하지만, 같은 인스턴스임을 보장하지는 않는다.
    
    ```java
    StackWalker luke = StackWalker.getInstance(options);
    ```
    

**getType**

- getInstance와 같으나, 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다.
    
    ```java
    Object newArray = Array.newInstance(classObject, arrayLen);
    ```
    

**newType**

- newInstance와 같으나 생성할 클래스가 아닌 다른 클래스에 팩터리 메서드를 정의할 때 쓴다.
    
    ```java
    BufferedReader br = Files.newBufferedReader(path);
    ```
    

**type**

- getType과 newType의 간결한 버전
    
    ```java
    List<Complaint> litany = Collections.list(legacyLitancy);
    ```
    

## 참고

- Effective Java 3/E (조슈아 블로크)
- [EnumSet이 new 연산자를 사용하지 않는 이유](https://siyoon210.tistory.com/152)