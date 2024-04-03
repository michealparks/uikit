import { Object3D } from 'three'
import { ContainerProperties, createContainer, destroyContainer } from '../components/container.js'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Component } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { TextProperties, createText, destroyText } from '../components/text.js'
import { FontFamilies } from '../internals.js'

export class Text extends Object3D {
  private object: Object3D
  public readonly internals: ReturnType<typeof createContainer>
  public readonly eventConfig: EventConfig

  private readonly propertiesSignal: Signal<TextProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly textSignal: Signal<string | Signal<string> | Array<string | Signal<string>>>
  private readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  constructor(
    parent: Component,
    text: string | Signal<string> | Array<string | Signal<string>>,
    fontFamilies: FontFamilies | undefined,
    properties: TextProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.textSignal = signal(text)
    this.fontFamiliesSignal = signal(fontFamilies)
    this.eventConfig = parent.eventConfig
    //setting up the threejs elements
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    //setting up the container
    this.internals = createText(
      parent.internals,
      this.textSignal,
      this.fontFamiliesSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this.object },
      { current: this },
    )

    //setup scrolling & events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, interactionPanel, this.eventConfig, subscriptions)
  }

  setFontFamilies(fontFamilies: FontFamilies) {
    this.fontFamiliesSignal.value = fontFamilies
  }

  setText(text: string | Signal<string> | Array<string | Signal<string>>) {
    this.textSignal.value = text
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    destroyText(this.internals)
  }
}
