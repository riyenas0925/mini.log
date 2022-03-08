---
title: "3. private 생성자나 열거 타입으로 싱글턴임을 보증하라"
description: "3. private 생성자나 열거 타입으로 싱글턴임을 보증하라"
date: 2021-04-04
update: 2021-04-04
tags:
  - Effective Java
  - 학습 기록
series: "Test Code로 보는 Effective Java"
---

## 싱글턴

- 싱글턴이란 인스턴스를 오직 하나만 생성할 수 있는 클래스를 말한다.
- 무상태 객체나 설계상 유일해야 하는 시스템 컴포턴트가 싱글턴의 전형적인 예다.

## 싱글턴을 만드는 방식

### 1. public static final 필드 방식의 싱글턴

- pivate 생성자는 public static final 필드인 Singleton1.INSTANCE를 초기화할 때 딱 한 번만 호출된다.
- Singleton1 클래스가 초기화될 때 만들어진 인스턴스가 전체 시스템에서 하나뿐임이 보장된다.

```java
public class Singleton1 {
    public static final Singleton1 INSTANCE = new Singleton1();

    private Singleton1() {

    }
}
```

```java
@Test
@DisplayName("인스턴스가 전체 시스템에서 하나뿐임이 보장된다.")
public void singleton() {
    Singleton1 instance1 = Singleton1.INSTANCE;
    Singleton1 instance2 = Singleton1.INSTANCE;

    Assertions.assertSame(instance1, instance2);
}
```

다만 예외가 한가지 있는데 아래와 같이 권한이 있는 클라이언트는 **리플렉션 API**인 **AccessibleObject.set Accesible**을 사용해 private 생성자를 호출할 수 있다.

```java
@Test
@DisplayName("리플렉션을 사용하면 private 생성자를 호출할 수 있다.")
public void reflection() throws Exception {
    Singleton1 singleton1 = Singleton1.INSTANCE;
    Singleton1 singleton1Reflection;

    Constructor<Singleton1> constructor = Singleton1.class.getDeclaredConstructor();
    constructor.setAccessible(true);
    singleton1Reflection = constructor.newInstance();

    Assertions.assertNotSame(singleton1, singleton1Reflection);
}
```

이러한 공격을 방어하려면 생성자를 수정하여 두 번째 객체가 생성되려 할 때 예외를 던지게 하면 된다.

### 2. 정적 팩터리 방식의 싱글턴

- **Singleton2.getInstance**는 항상 같은 객체의 참조를 반환하므로 제 2의 Singleton2 인스턴스란 결코 만들어지지 않는다.
- public static final 필드 방식과 마찬가지로 리플렉션을 통한 예외는 똑같이 적용된다.

```java
public class Singleton2 {
    public static final Singleton2 INSTANCE = new Singleton2();

    private Singleton2() {

    }

    public static Singleton2 getInstance() {
        return INSTANCE;
    }
}
```

```java
@Test
@DisplayName("인스턴스가 전체 시스템에서 하나뿐임이 보장된다.")
public void singleton() {
    Singleton2 instance1 = Singleton2.getInstance();
    Singleton2 instance2 = Singleton2.getInstance();

    Assertions.assertSame(instance1, instance2);
}
```

정적 팩터리 방식은 아래와 같이 3가지 장점을 가진다.

- API를 바꾸지 않고도 싱글턴이 아니게 변경할 수 있다는 점
- 정적 팩터리를 제네릭 싱글턴 팩터리로 만들 수 있다는 점
- 정적 팩터리의 메서드 참조를 공급자(supplier)로 사용할 수 있다는 점

### 3. 열거 타입 방식의 싱글턴 (바람직한 방법)

- **public 필드 방식**과 비슷하지만, 더 간결하고, 추가 노력 없이 직렬화할 수 있다.
- 아주 복잡한 직렬화 상황이나 리플렉션 공격에서도 제2의 인스턴스가 생기는 일을 완벽히 막아준다.
- 대부분 상황에서 **싱글턴을 만드는 가장 좋은 방법**

```java
public enum Elvis {
	INSTANCE;
	
	public void leaveTheBuilding() { ... }
}
```

## 참고

- Effective Java 3/E (조슈아 블로크)
- [Java: accessing private constructor with type parameters](https://stackoverflow.com/questions/5629706/java-accessing-private-constructor-with-type-parameters)