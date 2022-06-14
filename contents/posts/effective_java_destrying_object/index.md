---
title: "7. 다 쓴 객체 참조를 해제하라"
description: "7. 다 쓴 객체 참조를 해제하라"
date: 2021-09-02
update: 2021-09-02
tags:
  - Effective Java
  - log
series: "Test Code로 보는 Effective Java"
---

## 캐시

객체 참조를 캐시에 넣고 나서 그 객체를 다 쓴 뒤로도 한참을 그냥 놔두는 일을 자주 접할 수 있다. 운 좋게 캐시 외부에서 키를 참조하는 동안만 엔트리가 살아 있는 캐시가 필요한 상황이라면 **WeakHashMap**을 사용해 캐시를 만들자. 다 쓴 엔트리는 그 즉시 자동으로 제거될 것이다.

### WeakHashMap에서는 어떻게 동작할까?

> WeakHashMap은 일반적인 방법으로 key를 통해 value에 접근하지 못한다면 key, value를 삭제한다.
> 

아래의 테스트 코드를 보면 key1의 값을 null이 된다면 정상적인 방법으로 key1에 해당하는 value값을 접근할 수 없게 된다. 따라서 GC가 key1에 해당하는 **key/value**를 자동으로 제거한다. 따라서 **GC**가 발생한다음 map의 size는 1이 된다. 만약 아래의 테스트 코드를 **WeakHashMap**이 아닌 **HashMap**으로 변경한다면 **GC**가 발생해도 삭제되지 않기 때문에 map의 size는 2가 된다.

```java
@Test
public void weakHashMap() throws InterruptedException {
    //given
    WeakHashMap<Object, String> map = new WeakHashMap<>();

    Object key1 = new Object();
    Object key2 = new Object();

    map.put(key1, "Test 1");
    map.put(key2, "Test 2");

    //when
    key1 = null;

    System.gc();    //gc가 바로 실행된다는 보장은 없음
    Thread.sleep(100);

    //that
    map.entrySet().stream().forEach(el -> System.out.println(el));
	 
    assertThat(map.size()).isEqualTo(1); //key1에 해당하는 key/value pair은 제거된다(GC).
}
```

### HashMap에서는 어떻게 동작할까?

만약 **WeakHashMap**이 아닌 **HashMap**으로 변경한다면 **GC**가 발생해도 엔트리가 삭제되지 않기 때문에 map의 size는 2가 된다.

```java
@Test
public void hashMap() throws InterruptedException {
    //given
    HashMap<Object, String> map = new HashMap<>();

    Object key1 = new Object();
    Object key2 = new Object();

    map.put(key1, "Test 1");
    map.put(key2, "Test 2");

    //when
    key1 = null;

    System.gc();    //gc가 바로 실행된다는 보장은 없음
    Thread.sleep(100);

    //that
    map.entrySet().stream().forEach(v -> System.out.println(v));

    assertThat(map.size()).isEqualTo(2);
}
```

캐시를 만들 때 보통은 캐시 엔트리의 유효 기간을 정확히 정의하기 어렵기 때문에 시간이 지날수록 가치를 떨어뜨리는 방식을 흔히 사용한다. 이런 방식에서는 **쓰지 않는 엔트리를 이따금 청소**해줘야 한다. **백그라운드 스레드를 활용(ScheduledThreadPoolExcuter)**하거나 캐시에 새 엔트리를 추가할 때 **부수 작업으로 수행하는 방법(LinkedHashMap의 removeEldestEntity)**이 있다.

### LinkedHashMap의 removeEldestEntry()

이 메서드는 **put()** 메서드, **putAll()** 메서드가 호출될 때 불리게 되는데 **LinkedHashMap**의 사이즈가 **MAX_ENTRIES**보다 클때 자동으로 가장 오래된 데이터를 삭제할 수 있다. 

이 메서드는 정해진 **사이즈 이상의 엔트리가 들어오면 제일 오래된 엔트리를 삭제**하고 **새로운 엔트리를 저장**하기 때문에 쓰지 않는 엔트리가 저장되지 않는 장점이 있다.

```java
@Test
public void linkedHashMap_removeEldestEntry() {
    //given
    final int MAX_ENTRIES = 4;

    LinkedHashMap<Integer, String> linkedHashMap = new LinkedHashMap<Integer, String>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry eldest) {
            return size() > MAX_ENTRIES;
        }
    };

    linkedHashMap.put(0, "Test 0"); linkedHashMap.put(1, "Test 1");
    linkedHashMap.put(2, "Test 2"); linkedHashMap.put(3, "Test 3");

    //when
    linkedHashMap.put(4, "Test 4"); // MAX_ENTRIES 개수 이상이 들어온다면

    //that
		assertThat(linkedHashMap.containsKey(0)).isFalse(); // 가장 오래된 엔트리는 삭제된다.
    assertThat(linkedHashMap.containsKey(1)).isTrue();
    assertThat(linkedHashMap.containsKey(2)).isTrue();
    assertThat(linkedHashMap.containsKey(3)).isTrue();
    assertThat(linkedHashMap.containsKey(4)).isTrue();  // 가장 최근에 추가된 엔트리
}
```

## 정리

- 캐시 역시 메모리 누수를 일으키는 주범이다. 캐시 외부에서 키를 참조하는 동안만 엔트리가 살아 있는 캐시가 필요한 상황이라면 WeakHashMap을 사용하자.
- 리스너 혹은 콜백 또한 약한 참조(Weak Reference)를 에 저장해 가비지 컬렉터가 즉시 수거하도록 한다.

## 참고

- [WeakHashMap에 대해 제대로 이해하자.](https://aroundck.tistory.com/3057)
- [Java – Collection – Map – WeakHashMap (약한 참조 해시맵)](http://blog.breakingthat.com/2018/08/26/java-collection-map-weakhashmap/)
- [Java Reference와 GC](https://d2.naver.com/helloworld/329631)
- [Guide to WeakHashMap in Java](https://www.baeldung.com/java-weakhashmap)
- [반복적으로 사용되는 인스턴스 캐싱하기](https://velog.io/@lxxjn0/반복적으로-사용되는-인스턴스-캐싱하기)
- [자바 메모리 누수 확인](https://gmby.tistory.com/entry/메모리-누수-테스트)