---
title: "4. 인스턴스화를 막으려거든 private 생성자를 사용하라"
description: "4. 인스턴스화를 막으려거든 private 생성자를 사용하라"
date: 2021-04-05
update: 2021-04-05
tags:
  - Effective Java
  - 자바
series: "Effective Java Study"
---

### 인스턴스화가 필요없는 클래스

- **java.lang.Math**, **java.util.Arrays**와 같은 **기본 타입 값**이나 **배열 관련 메서드**
- **java.util.Collections**처럼 특정 인터페이스를 구현하는 객체를 생성해주는 **정적 메서드** (팩터리)
- **final 클래스**와 관련한 메서드들을 모아놓을 때

정적 멤버만 담은 유틸리티 클래스는 인스턴스로 만들어 쓰려고 설계한 게 아니다. 하지만 생성자를 명시하지 않으면 컴파일러가 자동으로 기본 생성자를 만들어주기 때문에 사용자는 생성자가 자동 생성된 것인지 구분할 수 없게된다.

### 추상클래스를 사용해서 막을수 있을까?

아래와 같이 **추상클래스(UtilityClass)**의 **하위 클래스(SubUtilityClass)**를 만드는 것 만으로 인스턴스화를 할 수 있기 때문에 **추상클래스로는 인스턴스화를 막을 수 없다.**

```java
abstract class UtilityClass {

}

public class SubUtilityClass extends UtilityClass{

}
```

```java
@Test
public void test() {
    // UtilityClass utilityClass = new UtilityClass();
		// 추상클래스의 경우 하위 클래스를 만들어 인스턴스화 할 수 있다.
    SubUtilityClass utilityClass = new SubUtilityClass();
}
```

### 어떻게 인스턴스화를 막을 수 있을까?

컴파일러는 명시된 생성자가 없을 때 기본 생성자를 만들기 때문에 아래처럼 **private 생성자**를 추가하면 클래스의 인스턴스화를 막을 수 있다.

```java
public class UtilityClass {
    // 기본 생성자가 만들어지는 것을 막는다(인스턴스화 방지용)
    private UtilityClass() {
				// 클래스 내부에서도 실수로라도 생성자를 호출하지 않도록 막기 위해
        throw new AssertionError();
    }
}
```

부가적으로 모든 생성자는 명시적이든 묵시적이든 상위 클래스의 생성자를 호출하는데 생성자가 private로 선언되어 있어 하위클래스가 상위 클래스의 생성자에 접근할 방법이 없어지고  **상속을 불가능하게 해준다.**

### 참고

- Effective Java 3/E (조슈아 블로크)